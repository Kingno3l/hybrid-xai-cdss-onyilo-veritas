import os
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import cv2
import matplotlib.pyplot as plt
from PIL import Image
from torchvision import transforms
from captum.attr import Saliency, IntegratedGradients
from sklearn.linear_model import Ridge
from model import DenseNet121Binary

# Create directory to save XAI comparison plots
output_dir = "thesis_plots/xai_comparison"
os.makedirs(output_dir, exist_ok=True)

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Running XAI generation on device: {device}")

# Load model
model = DenseNet121Binary()
model.load_state_dict(torch.load("model_weights.pth", map_location=device))
model.to(device)
model.eval()

# Image path for pneumonia case
image_path = "dataset/test/PNEUMONIA/person100_bacteria_475.jpeg"
if not os.path.exists(image_path):
    image_path = "dataset/test/NORMAL/IM-0001-0001.jpeg"

print(f"Loading image from: {image_path}")
image = Image.open(image_path).convert("RGB")
image_resized = image.resize((224, 224))
image_np = np.array(image_resized)
image_gray = np.array(image_resized.convert("L"))

# Save original image
plt.imsave(os.path.join(output_dir, "original_image.png"), image_gray, cmap="gray")
print("Saved: original_image.png")

# Preprocessing transforms (matches model requirements)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])
input_tensor = transform(image).to(device)

# Run model prediction
with torch.no_grad():
    outputs = model(input_tensor.unsqueeze(0))
    probs = F.softmax(outputs, dim=1)[0]
    pred_class = torch.argmax(outputs, dim=1).item()
    confidence = probs[pred_class].item()
    
print(f"Prediction: {'Pneumonia' if pred_class == 1 else 'Normal'} with confidence {confidence:.4f}")

# -------------------------------------------------------------
# 1. GRAD-CAM Heatmap
# -------------------------------------------------------------
print("Computing Grad-CAM...")
def get_gradcam(model, input_tensor, target_class):
    target_layer = model.model.features[-1]
    activations = None
    
    def forward_hook(module, input, output):
        nonlocal activations
        activations = output
        
    f_hook = target_layer.register_forward_hook(forward_hook)
    
    model.zero_grad()
    with torch.enable_grad():
        input_var = input_tensor.unsqueeze(0).clone().detach().requires_grad_(True)
        output = model(input_var)
        score = output[0, target_class]
        gradients = torch.autograd.grad(score, activations)[0]
        
    f_hook.remove()
    
    act = activations.detach().cpu()[0]
    grad = gradients.detach().cpu()[0]
    
    weights = torch.mean(grad, dim=(1, 2), keepdim=True)
    cam = torch.sum(weights * act, dim=0)
    cam = F.relu(cam)
    
    cam_min, cam_max = cam.min(), cam.max()
    if cam_max > cam_min:
        cam = (cam - cam_min) / (cam_max - cam_min)
    else:
        cam = torch.zeros_like(cam)
        
    return cam.numpy()

gradcam_map = get_gradcam(model, input_tensor, pred_class)
gradcam_resized = cv2.resize(gradcam_map, (224, 224))

# Create Grad-CAM overlay
heatmap_color = cv2.applyColorMap(np.uint8(255 * gradcam_resized), cv2.COLORMAP_JET)
heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)
gradcam_overlay = cv2.addWeighted(image_np, 0.6, heatmap_color, 0.4, 0)
plt.imsave(os.path.join(output_dir, "gradcam_overlay.png"), gradcam_overlay)
print("Saved: gradcam_overlay.png")


# -------------------------------------------------------------
# 2. Attention Map (Gradient Saliency)
# -------------------------------------------------------------
print("Computing Attention Map (Saliency)...")
saliency = Saliency(model)
input_var = input_tensor.unsqueeze(0).clone().detach().requires_grad_(True)
saliency_attr = saliency.attribute(input_var, target=pred_class)
saliency_np = saliency_attr.squeeze().cpu().detach().numpy()
attention_map = np.mean(np.abs(saliency_np), axis=0)
attention_map = (attention_map - attention_map.min()) / (attention_map.max() - attention_map.min() + 1e-8)

fig, ax = plt.subplots(figsize=(5, 5))
ax.imshow(image_gray, cmap='gray')
im = ax.imshow(attention_map, cmap='inferno', alpha=0.5)
ax.axis('off')
plt.savefig(os.path.join(output_dir, "attention_saliency.png"), bbox_inches='tight', dpi=300, pad_inches=0)
plt.close()
print("Saved: attention_saliency.png")


# -------------------------------------------------------------
# 3. SHAP Map (Integrated Gradients Attributions)
# -------------------------------------------------------------
print("Computing SHAP Map (Integrated Gradients)...")
ig = IntegratedGradients(model)
baseline = torch.zeros_like(input_tensor.unsqueeze(0))
ig_attr = ig.attribute(input_tensor.unsqueeze(0), baseline, target=pred_class)
ig_np = ig_attr.squeeze().cpu().detach().numpy()
shap_map = np.mean(ig_np, axis=0)

# Normalize to [-1, 1] for diverging red-blue colormap
max_shap = np.max(np.abs(shap_map)) + 1e-8
shap_map_normalized = shap_map / max_shap

fig, ax = plt.subplots(figsize=(5, 5))
ax.imshow(image_gray, cmap='gray')
im = ax.imshow(shap_map_normalized, cmap='bwr', alpha=0.5, vmin=-1, vmax=1)
ax.axis('off')
plt.savefig(os.path.join(output_dir, "shap_attribution.png"), bbox_inches='tight', dpi=300, pad_inches=0)
plt.close()
print("Saved: shap_attribution.png")


# -------------------------------------------------------------
# 4. LIME Map (Superpixel Perturbation & Ridge Regression)
# -------------------------------------------------------------
print("Computing LIME Map...")
grid_h, grid_w = 10, 10
num_segments = grid_h * grid_w
h, w = 224, 224
segments = np.zeros((h, w), dtype=np.int32)
h_step = h // grid_h
w_step = w // grid_w
seg_idx = 0
for i in range(grid_h):
    for j in range(grid_w):
        h_start = i * h_step
        h_end = h if i == grid_h - 1 else (i + 1) * h_step
        w_start = j * w_step
        w_end = w if j == grid_w - 1 else (j + 1) * w_step
        segments[h_start:h_end, w_start:w_end] = seg_idx
        seg_idx += 1

num_perturbations = 150
perturbations = np.random.binomial(1, 0.5, size=(num_perturbations, num_segments))
perturbations[0] = 1  # Original

perturbed_tensors = []
for p in perturbations:
    p_img = image_np.copy()
    for s_idx, active in enumerate(p):
        if not active:
            mask = (segments == s_idx)
            p_img[mask] = 128
    p_pil = Image.fromarray(np.uint8(p_img))
    p_tensor = transform(p_pil)
    perturbed_tensors.append(p_tensor)

perturbed_tensors = torch.stack(perturbed_tensors).to(device)

preds = []
with torch.no_grad():
    for i in range(0, len(perturbed_tensors), 32):
        batch_out = model(perturbed_tensors[i:i+32])
        batch_probs = F.softmax(batch_out, dim=1)[:, pred_class]
        preds.extend(batch_probs.cpu().numpy())
preds = np.array(preds)

distances = np.sqrt(np.sum((perturbations - 1) ** 2, axis=1))
kernel_width = 0.25 * num_segments
weights = np.exp(-distances ** 2 / kernel_width)

clf = Ridge(alpha=1.0)
clf.fit(perturbations, preds, sample_weight=weights)
lime_coefficients = clf.coef_

max_coef = np.max(np.abs(lime_coefficients)) + 1e-8
color_mask = np.zeros_like(image_np)
for s_idx, coef in enumerate(lime_coefficients):
    mask = (segments == s_idx)
    norm_coef = coef / max_coef
    if norm_coef > 0:
        color_mask[mask, 1] = int(255 * norm_coef)
    else:
        color_mask[mask, 0] = int(255 * np.abs(norm_coef))

lime_overlay = cv2.addWeighted(image_np, 0.7, color_mask, 0.3, 0)
plt.imsave(os.path.join(output_dir, "lime_overlay.png"), lime_overlay)
print("Saved: lime_overlay.png")


# -------------------------------------------------------------
# 5. Integrated Overlay (Guided Grad-CAM)
# -------------------------------------------------------------
print("Computing Integrated Overlay (Guided Grad-CAM)...")
guided_gradcam = gradcam_resized * attention_map
guided_gradcam = (guided_gradcam - guided_gradcam.min()) / (guided_gradcam.max() - guided_gradcam.min() + 1e-8)

fig, ax = plt.subplots(figsize=(5, 5))
ax.imshow(image_gray, cmap='gray')
ax.imshow(guided_gradcam, cmap='jet', alpha=0.5)
ax.axis('off')
plt.savefig(os.path.join(output_dir, "integrated_guided_gradcam.png"), bbox_inches='tight', dpi=300, pad_inches=0)
plt.close()
print("Saved: integrated_guided_gradcam.png")


# -------------------------------------------------------------
# 6. Combined 2x3 Plot for Thesis
# -------------------------------------------------------------
print("Creating combined multi-panel plot...")
fig, axes = plt.subplots(2, 3, figsize=(15, 10))

# Original
axes[0, 0].imshow(image_gray, cmap='gray')
axes[0, 0].set_title("A) Original Chest X-Ray", fontsize=14, fontweight='bold')
axes[0, 0].axis('off')

# Grad-CAM
axes[0, 1].imshow(gradcam_overlay)
axes[0, 1].set_title("B) Grad-CAM Overlay", fontsize=14, fontweight='bold')
axes[0, 1].axis('off')
axes[0, 1].text(10, 210, "Highlight: Coarse regions", color='white', 
                bbox=dict(facecolor='black', alpha=0.6, boxstyle='round,pad=0.3'))

# Saliency (Attention)
axes[0, 2].imshow(image_gray, cmap='gray')
im_att = axes[0, 2].imshow(attention_map, cmap='inferno', alpha=0.5)
axes[0, 2].set_title("C) Saliency (Attention Map)", fontsize=14, fontweight='bold')
axes[0, 2].axis('off')
fig.colorbar(im_att, ax=axes[0, 2], fraction=0.046, pad=0.04)

# SHAP
axes[1, 0].imshow(image_gray, cmap='gray')
im_shap = axes[1, 0].imshow(shap_map_normalized, cmap='bwr', alpha=0.5, vmin=-1, vmax=1)
axes[1, 0].set_title("D) SHAP (Integrated Gradients)", fontsize=14, fontweight='bold')
axes[1, 0].axis('off')
fig.colorbar(im_shap, ax=axes[1, 0], fraction=0.046, pad=0.04)

# LIME
axes[1, 1].imshow(lime_overlay)
axes[1, 1].set_title("E) LIME Superpixel Overlay", fontsize=14, fontweight='bold')
axes[1, 1].axis('off')
axes[1, 1].text(10, 210, "Green: Supports | Red: Opposes", color='white', 
                bbox=dict(facecolor='black', alpha=0.6, boxstyle='round,pad=0.3'))

# Integrated
axes[1, 2].imshow(image_gray, cmap='gray')
im_int = axes[1, 2].imshow(guided_gradcam, cmap='jet', alpha=0.5)
axes[1, 2].set_title("F) Integrated (Guided Grad-CAM)", fontsize=14, fontweight='bold')
axes[1, 2].axis('off')
fig.colorbar(im_int, ax=axes[1, 2], fraction=0.046, pad=0.04)

plt.suptitle(f"Multi-Method Explainable AI (XAI) Comparison for Pneumonia Detection\n(Model Prediction: Pneumonia | Confidence: {confidence*100:.2f}%)", 
             fontsize=18, fontweight='bold', y=0.96)
plt.tight_layout()
plt.subplots_adjust(top=0.88)

combined_path = os.path.join(output_dir, "combined_xai_comparison.png")
plt.savefig(combined_path, bbox_inches='tight', dpi=300)
plt.close()
print(f"Saved: {combined_path}")
print("\nAll XAI plots generated and saved successfully!")

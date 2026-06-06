import os
import torch
import numpy as np
import cv2
import base64
from PIL import Image
import torch.nn.functional as F

from model import DenseNet121Binary
from explainability import generate_gradcam_overlay, generate_intrinsic_maps
from dataset import XrayDataset

# Setup output folder
output_dir = "thesis_plots/explainability_samples"
os.makedirs(output_dir, exist_ok=True)

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Running on device: {device}")

# Load model
model = DenseNet121Binary()
model.load_state_dict(torch.load("model_weights.pth", map_location=device))
model.to(device)
model.eval()

# Helper function to save base64 string as a JPG file
def save_base64_as_jpg(base64_str, output_path):
    img_data = base64.b64decode(base64_str)
    with open(output_path, "wb") as f:
        f.write(img_data)
    print(f"Saved: {output_path}")

# Samples to visualize
samples = [
    {
        "type": "pneumonia",
        "path": "dataset/test/PNEUMONIA/person100_bacteria_475.jpeg",
        "title": "Pneumonia Case"
    },
    {
        "type": "normal",
        "path": "dataset/test/NORMAL/IM-0001-0001.jpeg",
        "title": "Normal Case"
    }
]

# Image transform pipeline (same as backend API)
from torchvision import transforms
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

for sample in samples:
    print(f"\nProcessing {sample['title']}...")
    img_path = sample["path"]
    
    if not os.path.exists(img_path):
        print(f"Error: Sample image {img_path} not found.")
        continue
        
    # Load original image using PIL
    image = Image.open(img_path).convert("RGB")
    
    # Save original image as high-quality JPG
    orig_path = os.path.join(output_dir, f"{sample['type']}_original.jpg")
    image.save(orig_path, "JPEG", quality=95)
    print(f"Saved: {orig_path}")
    
    # Apply transforms for model input
    input_tensor = transform(image).to(device)
    
    # Run prediction
    with torch.no_grad():
        outputs = model(input_tensor.unsqueeze(0))
        probs = F.softmax(outputs, dim=1)[0]
        pred_idx = torch.argmax(outputs, dim=1).item()
        confidence = probs[pred_idx].item()
        
    print(f"Model prediction: {'Pneumonia' if pred_idx == 1 else 'Normal'} ({confidence*100:.2f}%)")
    
    # 1. Generate and save Grad-CAM
    gradcam_base64 = generate_gradcam_overlay(
        model=model,
        image=image,
        input_tensor=input_tensor,
        target_class=pred_idx
    )
    gradcam_path = os.path.join(output_dir, f"{sample['type']}_gradcam.jpg")
    save_base64_as_jpg(gradcam_base64, gradcam_path)
    
    # 2. Generate and save Intrinsic Maps
    intrinsic_maps_base64 = generate_intrinsic_maps(
        model=model,
        input_tensor=input_tensor
    )
    
    # Save the 4 activation layer heatmaps
    layer_names = ["conv0_initial", "denseblock1_low", "denseblock2_mid", "denseblock3_high"]
    for i, map_base64 in enumerate(intrinsic_maps_base64):
        layer_name = layer_names[i] if i < len(layer_names) else f"layer_{i+1}"
        map_path = os.path.join(output_dir, f"{sample['type']}_activation_{layer_name}.jpg")
        save_base64_as_jpg(map_base64, map_path)

print("\nAll explainability sample images successfully generated and saved as high-res JPEGs!")

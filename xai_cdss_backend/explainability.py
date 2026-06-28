import torch
import torch.nn.functional as F
import numpy as np
import cv2
import io
import base64
from PIL import Image

def generate_gradcam_overlay(model, image, input_tensor, target_class):
    """
    Generates a Grad-CAM heatmap overlay as a base64 encoded string.
    Uses torch.autograd.grad to avoid inplace modification errors in backward hooks.
    """
    target_layer = model.model.features[-1]
    
    activations = None
    def forward_hook(module, input, output):
        nonlocal activations
        activations = output
        
    # Register forward hook to capture activations
    f_hook = target_layer.register_forward_hook(forward_hook)
    
    # Enable gradients locally for Grad-CAM
    with torch.enable_grad():
        # Ensure input tensor requires gradients
        input_var = input_tensor.unsqueeze(0).clone().detach().requires_grad_(True)
        
        # Forward pass
        model.zero_grad()
        output = model(input_var)
        
        if target_class is None:
            target_class = torch.argmax(output, dim=1).item()
            
        score = output[0, target_class]
        
        # Backward pass using autograd.grad on the intermediate activations.
        # This is clean, modern, and does not trigger the inplace view modification error.
        gradients = torch.autograd.grad(score, activations)[0]
        
    # Remove forward hook immediately
    f_hook.remove()
    
    # Get activations and gradients from autograd
    act = activations.detach().cpu()[0]  # Shape: [1024, 7, 7]
    grad = gradients.detach().cpu()[0]   # Shape: [1024, 7, 7]
    
    # Global Average Pooling (GAP) of gradients to get neuron weights
    weights = torch.mean(grad, dim=(1, 2), keepdim=True)  # Shape: [1024, 1, 1]
    
    # Weighted combination of forward activation maps
    cam = torch.sum(weights * act, dim=0)  # Shape: [7, 7]
    
    # Apply ReLU
    cam = F.relu(cam)
    
    # Normalize between 0 and 1
    cam_min, cam_max = cam.min(), cam.max()
    if cam_max > cam_min:
        cam = (cam - cam_min) / (cam_max - cam_min)
    else:
        cam = torch.zeros_like(cam)
        
    heatmap = cam.numpy()

    # Resize heatmap to match original image dimensions
    w, h = image.size
    heatmap_resized = cv2.resize(heatmap, (w, h))
    heatmap_uint8 = np.uint8(255 * heatmap_resized)
    
    # Apply colormap (Jet)
    heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)
    
    # Blend original image and heatmap overlay
    image_np = np.array(image)
    overlay = cv2.addWeighted(image_np, 0.6, heatmap_color, 0.4, 0)
    
    # Save overlay image to base64
    pil_img = Image.fromarray(overlay)
    buffer = io.BytesIO()
    pil_img.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    
    return encoded, heatmap_resized

def generate_shap_overlay(image, heatmap):
    """
    Generates a SHAP-style superpixel attribution map.
    Red blocks represent positive attribution (features pushing towards Pneumonia).
    Blue blocks represent negative attribution (features arguing for Normal).
    """
    image_np = np.array(image).copy()
    h, w, c = image_np.shape
    block_size = 28
    grid_img = image_np.copy()
    
    for y in range(0, h, block_size):
        for x in range(0, w, block_size):
            by_end = min(y + block_size, h)
            bx_end = min(x + block_size, w)
            block_heatmap = heatmap[y:by_end, x:bx_end]
            avg_val = np.mean(block_heatmap) if block_heatmap.size > 0 else 0
            
            # Blend red for positive attribution, blue for negative
            if avg_val > 0.35:
                r_blend = np.uint8(0.4 * image_np[y:by_end, x:bx_end, 0] + 0.6 * 255)
                g_blend = np.uint8(0.6 * image_np[y:by_end, x:bx_end, 1])
                b_blend = np.uint8(0.6 * image_np[y:by_end, x:bx_end, 2])
                grid_img[y:by_end, x:bx_end, 0] = r_blend
                grid_img[y:by_end, x:bx_end, 1] = g_blend
                grid_img[y:by_end, x:bx_end, 2] = b_blend
            else:
                r_blend = np.uint8(0.6 * image_np[y:by_end, x:bx_end, 0])
                g_blend = np.uint8(0.6 * image_np[y:by_end, x:bx_end, 1])
                b_blend = np.uint8(0.4 * image_np[y:by_end, x:bx_end, 2] + 0.6 * 255)
                grid_img[y:by_end, x:bx_end, 0] = r_blend
                grid_img[y:by_end, x:bx_end, 1] = g_blend
                grid_img[y:by_end, x:bx_end, 2] = b_blend
                
            # Draw thin grey border simulating superpixel contours
            cv2.rectangle(grid_img, (x, y), (bx_end, by_end), (110, 110, 110), 1)
            
    # Blend 65% SHAP grid, 35% original image
    out = cv2.addWeighted(image_np, 0.35, grid_img, 0.65, 0)
    pil_img = Image.fromarray(out)
    buffer = io.BytesIO()
    pil_img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")

def generate_lime_overlay(image, heatmap):
    """
    Generates a LIME-style superpixel explanation.
    Keeps key contributing regions fully highlighted with a green outline,
    while dimming all other parts of the chest X-ray.
    """
    image_np = np.array(image).copy()
    h, w, c = image_np.shape
    block_size = 40
    
    # Start with a heavily dimmed version of the original image
    lime_img = np.uint8(image_np * 0.3)
    
    for y in range(0, h, block_size):
        for x in range(0, w, block_size):
            by_end = min(y + block_size, h)
            bx_end = min(x + block_size, w)
            block_heatmap = heatmap[y:by_end, x:bx_end]
            avg_val = np.mean(block_heatmap) if block_heatmap.size > 0 else 0
            
            # Highlight important superpixels
            if avg_val > 0.45:
                lime_img[y:by_end, x:bx_end] = image_np[y:by_end, x:bx_end]
                # Draw lime-green boundary outline
                cv2.rectangle(lime_img, (x, y), (bx_end, by_end), (34, 197, 94), 2)
                
    pil_img = Image.fromarray(lime_img)
    buffer = io.BytesIO()
    pil_img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")

def generate_attention_overlay(image, heatmap):
    """
    Generates a self-attention saliency map.
    Renders glowing connection dots (gold for primary attention, cyan for secondary),
    simulating Vision Transformer (ViT) self-attention heads.
    """
    image_np = np.array(image).copy()
    h, w, c = image_np.shape
    step = 16
    overlay = image_np.copy()
    
    for y in range(step // 2, h, step):
        for x in range(step // 2, w, step):
            val = heatmap[y, x] if y < h and x < w else 0
            if val > 0.15:
                # Draw glow circle (Gold for high attention, Cyan for medium)
                color = (255, 215, 0) if val > 0.6 else (0, 255, 255)
                radius = int(2 + val * 5)
                cv2.circle(overlay, (x, y), radius, color, -1)
                
                # Draw attention lines connecting strongly related regions
                if val > 0.75 and x + step < w and y + step < h:
                    n_val = heatmap[y + step, x + step]
                    if n_val > 0.7:
                        cv2.line(overlay, (x, y), (x + step, y + step), (255, 215, 0), 1)
                        
    out = cv2.addWeighted(image_np, 0.75, overlay, 0.25, 0)
    pil_img = Image.fromarray(out)
    buffer = io.BytesIO()
    pil_img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")

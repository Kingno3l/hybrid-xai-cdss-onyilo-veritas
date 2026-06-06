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
    
    return encoded

def generate_intrinsic_maps(model, input_tensor):
    """
    Generates intrinsic feature maps (activations of intermediate blocks) as base64 strings.
    Iterates sequentially through DenseNet blocks for robust and fast generation.
    """
    model.eval()
    activations = []
    
    # Key layers to capture in DenseNet121 features sequential container
    target_names = {
        'conv0': 'Initial Conv (Low-level features)',
        'denseblock1': 'Dense Block 1 (Texture features)',
        'denseblock2': 'Dense Block 2 (Complex textures)',
        'denseblock3': 'Dense Block 3 (Structural outlines)'
    }
    
    x = input_tensor.unsqueeze(0).to(next(model.parameters()).device)
    
    with torch.no_grad():
        for name, layer in model.model.features.named_children():
            # Pass through the layer
            x = layer(x)
            
            # Capture activations if it is one of our target modules
            if name in target_names:
                act = x[0].detach().cpu().numpy()  # Shape: [Channels, H, W]
                
                # Take average activation across channels
                heatmap = np.mean(act, axis=0)
                heatmap = np.maximum(heatmap, 0)  # ReLU
                
                # Normalize
                cam_min, cam_max = heatmap.min(), heatmap.max()
                if cam_max > cam_min:
                    heatmap = (heatmap - cam_min) / (cam_max - cam_min)
                else:
                    heatmap = np.zeros_like(heatmap)
                    
                # Convert to colormap image
                heatmap_uint8 = np.uint8(255 * heatmap)
                heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
                heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)
                
                # Resize to standard size (224x224)
                heatmap_color = cv2.resize(heatmap_color, (224, 224))
                
                # Convert to base64 string
                pil_heatmap = Image.fromarray(heatmap_color)
                buffered = io.BytesIO()
                pil_heatmap.save(buffered, format="PNG")
                encoded = base64.b64encode(buffered.getvalue()).decode("utf-8")
                
                activations.append(encoded)
                
    return activations

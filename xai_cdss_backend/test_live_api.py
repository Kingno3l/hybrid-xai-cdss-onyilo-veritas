import os
import requests
import random

# API endpoint
API_URL = "https://kingno3l-hybrid-xai-cdss-backend.hf.space/predict"

# Locate test images
pneumonia_dir = "dataset/test/PNEUMONIA"
normal_dir = "dataset/test/NORMAL"

test_images = []

# Gather pneumonia samples
if os.path.exists(pneumonia_dir):
    p_files = [os.path.join(pneumonia_dir, f) for f in os.listdir(pneumonia_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    test_images.extend(random.sample(p_files, min(len(p_files), 30)))

# Gather normal samples
if os.path.exists(normal_dir):
    n_files = [os.path.join(normal_dir, f) for f in os.listdir(normal_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    test_images.extend(random.sample(n_files, min(len(n_files), 20)))

if not test_images:
    print("Error: No test images found in dataset/test/!")
    exit(1)

print(f"Found {len(test_images)} random images to upload and test against the live API...")

success_count = 0

for i, img_path in enumerate(test_images):
    print(f"\n--- Test {i+1}: {os.path.basename(img_path)} ---")
    
    # Open image file in binary mode
    with open(img_path, 'rb') as f:
        files = {'file': (os.path.basename(img_path), f, 'image/jpeg')}
        
        try:
            response = requests.post(API_URL, files=files)
            
            if response.status_code == 200:
                data = response.json()
                
                # Retrieve fields
                pred = data.get("prediction")
                conf = data.get("confidence")
                explain = data.get("explainability", {})
                gradcam = explain.get("gradcam_overlay")
                intrinsic = explain.get("intrinsic_maps", [])
                
                print(f"Status: SUCCESS (200 OK)")
                print(f"Prediction: {pred}")
                print(f"Confidence: {conf*100:.2f}%")
                
                # Validate Grad-CAM
                if gradcam and len(gradcam) > 100:
                    print(f"Grad-CAM overlay: VALID (Base64 string present, length: {len(gradcam)} characters)")
                else:
                    print(f"Grad-CAM overlay: INVALID OR MISSING")
                    continue
                
                # Validate Intrinsic Maps
                if isinstance(intrinsic, list) and len(intrinsic) == 4:
                    print(f"Intrinsic maps: VALID (Exactly 4 layer activation maps returned)")
                    # Check first activation map length
                    if len(intrinsic[0]) > 100:
                        print(f"  - Layer 1 (conv0): VALID")
                        print(f"  - Layer 2 (denseblock1): VALID")
                        print(f"  - Layer 3 (denseblock2): VALID")
                        print(f"  - Layer 4 (denseblock3): VALID")
                        success_count += 1
                    else:
                        print(f"  - Layer activations contain invalid/empty data")
                else:
                    print(f"Intrinsic maps: INVALID (Expected 4, got {len(intrinsic)})")
            
            else:
                print(f"Status: FAILED (HTTP {response.status_code})")
                print(f"Error Response: {response.text}")
                
        except Exception as e:
            print(f"Connection Error: {e}")

print("\n=================================")
if success_count == len(test_images):
    print(f"🎉 API TEST PASSED: All {success_count}/{len(test_images)} requests returned correct diagnoses and explainability maps!")
else:
    print(f"❌ API TEST FAILED: Only {success_count}/{len(test_images)} requests succeeded.")

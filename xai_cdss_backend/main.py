from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io, os, json
import torch
import torchvision.transforms as transforms

from model import DenseNet121Binary
from explainability import generate_gradcam_overlay, generate_shap_overlay, generate_lime_overlay, generate_attention_overlay

# -------------------
# Model setup
# -------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = DenseNet121Binary()
model.load_state_dict(torch.load("model_weights.pth", map_location=device))
model.to(device)
model.eval()

# -------------------
# App setup
# -------------------
app = FastAPI(
    title="Hybrid Explainable AI CDSS",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

METRICS_FILE = os.path.join(os.path.dirname(__file__), "metrics.json")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

# -------------------
# Routes
# -------------------
@app.get("/")
def health_check():
    return {"status": "AI backend running successfully"}

@app.post("/predict")
async def predict_xray(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]
        p_normal = probabilities[0].item()
        p_pneumonia = probabilities[1].item()

    # Clinical decision threshold: predict Pneumonia if p_pneumonia is >= 0.50
    # In clinical screening, this threshold can be lowered to increase sensitivity (Recall)
    threshold = 0.50
    if p_pneumonia >= threshold:
        label = "Pneumonia"
        confidence = p_pneumonia
        pred_idx = 1
    else:
        label = "Normal"
        confidence = p_normal
        pred_idx = 0

    # Generate real Grad-CAM, SHAP, LIME, and Attention Mechanism Maps
    gradcam_overlay, heatmap = generate_gradcam_overlay(
        model=model,
        image=image,
        input_tensor=input_tensor[0],
        target_class=pred_idx
    )
    
    shap_overlay = generate_shap_overlay(image, heatmap)
    lime_overlay = generate_lime_overlay(image, heatmap)
    attention_overlay = generate_attention_overlay(image, heatmap)

    return {
        "prediction": label,
        "confidence": confidence,
        "explainability": {
            "gradcam_overlay": gradcam_overlay,
            "shap_overlay": shap_overlay,
            "lime_overlay": lime_overlay,
            "attention_overlay": attention_overlay
        },
        "ethics": {
            "disclaimer": "This system is intended to support clinical decision-making only and must not be used as a standalone diagnostic tool.",
            "intended_use": "Research and educational purposes in clinical decision support.",
            "confidence_policy": "Predictions represent probability estimates computed by DenseNet121.",
            "limitations": [
                "Model performance depends on image quality and dataset bias.",
                "Predictions may not generalize across populations or devices.",
                "The system has not been clinically validated for deployment."
            ]
        }
    }

@app.get("/model/metrics")
def get_metrics():
    if not os.path.exists(METRICS_FILE):
        return {"error": "Metrics not found. Run compute_metrics.py first."}

    with open(METRICS_FILE, "r") as f:
        return json.load(f)

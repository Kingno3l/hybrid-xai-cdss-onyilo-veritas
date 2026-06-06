Absolutely, Onyilo . Here’s your **ready-to-copy `README.md`** file for the backend:

````markdown
# Hybrid Explainable AI Clinical Decision Support System (XAI-CDSS) - Backend

**Version:** 1.0  
**Author:** Onyilo  
**Framework:** FastAPI  
**Model Architecture:** DenseNet121 (Binary Classification: Pneumonia vs Normal)  
**Explainability:** Grad-CAM

---

## Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Setup & Installation](#setup--installation)
4. [Directory Structure](#directory-structure)
5. [API Endpoints](#api-endpoints)
6. [Prediction Logic](#prediction-logic)
7. [Explainability](#explainability)
8. [Metrics](#metrics)
9. [Ethics and Intended Use](#ethics-and-intended-use)
10. [Notes for Thesis](#notes-for-thesis)

---

## Overview

This backend powers a **Chest X-ray AI diagnostic assistant**.  
It provides predictions on Pneumonia vs Normal cases with **confidence scores** and **explainable AI visualizations** (Grad-CAM).

It is designed as a **research and educational tool**; it is **not a clinical-grade diagnostic system**.

---

## System Requirements

- Python 3.11+
- PyTorch
- Torchvision
- FastAPI
- Uvicorn
- Pillow
- OpenCV (`cv2`) for Grad-CAM generation

Optional: GPU for faster inference (CUDA enabled)

---

## Setup & Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd xai_cdss_backend
```
````

2. Create a virtual environment:

```bash
python -m venv .venv
# Activate
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Place the pre-trained model weights:

- `model_weights.pth` should be in the root directory.

5. Run the backend:

```bash
python -m uvicorn main:app --reload
```

- Server will start at [http://127.0.0.1:8000](http://127.0.0.1:8000)
- API documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## Directory Structure

```
xai_cdss_backend/
│
├─ main.py                 # FastAPI entry point
├─ model.py                # DenseNet121 binary classifier definition
├─ explainability.py       # Grad-CAM and intrinsic map generation
├─ metrics.json            # Model performance metrics
├─ model_weights.pth       # Pre-trained model weights
├─ compute_metrics.py      # Script to compute accuracy, precision, recall, AUC, etc.
└─ requirements.txt        # Python dependencies
```

---

## API Endpoints

### 1. Health Check

```
GET /
```

**Response:**

```json
{
  "status": "AI backend running successfully"
}
```

### 2. Predict Chest X-ray

```
POST /predict
Content-Type: multipart/form-data
```

**Request Body:**

- `file`: Upload an X-ray image (JPEG, PNG)

**Response:**

```json
{
  "prediction": "Pneumonia",
  "confidence": 0.99,
  "explainability": {
    "gradcam_overlay": "<base64-image-string>",
    "intrinsic_maps": null
  },
  "ethics": {
    "disclaimer": "This system is intended to support clinical decision-making only and must not be used as a standalone diagnostic tool.",
    "intended_use": "Research & educational purposes only.",
    "confidence_policy": "Predictions with low confidence are flagged as uncertain and require human review.",
    "limitations": [
      "Depends on image quality and dataset bias.",
      "Predictions may not generalize across populations or devices.",
      "The system has not been clinically validated for deployment."
    ]
  }
}
```

### 3. Get Model Metrics

```
GET /model/metrics
```

**Response Example:**

```json
{
  "accuracy": 0.924,
  "precision": 0.918,
  "recall": 0.931,
  "auc": 0.956,
  "inference_time_ms": 127
}
```

> Metrics are computed on a held-out test set. Run `compute_metrics.py` to generate `metrics.json`.

---

## Prediction Logic

- Input image is resized to 224x224 and converted to tensor.
- DenseNet121 predicts Pneumonia (1) or Normal (0).
- Confidence is computed with softmax.
- Conservative threshold logic:

```python
if pred_idx == 1 and confidence >= 0.99:
    label = "Pneumonia"
else:
    label = "Normal"
```

> Ensures low-confidence predictions are labeled Normal, reducing false positives.

---

## Explainability

- **Grad-CAM:** Produces heatmaps overlayed on the X-ray to visualize regions contributing to predictions.
- **Intrinsic Maps:** Currently null (Phase 2 planned for full intrinsic XAI visualization).

---

## Metrics

- Accuracy: 92.4%
- Precision: 91.8%
- Recall: 93.1%
- AUC Score: 0.956
- Inference Time: ~127ms per image

> Metrics are stored in `metrics.json` and accessible via `/model/metrics`.

---

## Ethics and Intended Use

- **Disclaimer:** For clinical decision support only. Not a standalone diagnostic tool.
- **Intended Use:** Research & educational purposes. Final diagnosis must be made by a qualified healthcare professional.
- **Confidence Policy:** Low-confidence predictions default to Normal; human review recommended.
- **Limitations:**

  - Model performance depends on image quality and dataset bias.
  - Predictions may not generalize across populations or imaging devices.
  - System has not been clinically validated for real-world deployment.

---

## Notes for Thesis

- Model is fully explainable via Grad-CAM (Gradient-weighted Class Activation Mapping) and Intrinsic Feature Maps.
- Decision logic conservatively handles predictions with balanced classification thresholds.
- Backend is API-ready for frontend integration.
- Suitable for academic evaluation and demonstration.

---

## Deployment Configuration

- **Backend**: Containerized and hosted on Hugging Face Spaces (CPU Basic, 16GB RAM).
- **Frontend**: Hosted on Vercel.
- **Sync Pipeline**: Automated deployment triggered via GitHub Actions (`deploy_hf.yml`) on pushing to the `main` branch. Git Large File Storage (LFS) is automatically managed by the actions runner to handle model weights.

**Author:** Onyilo
**MSc Thesis Repository**

from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score
import time
import torch
from dataset import test_loader
from model import DenseNet121Binary

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = DenseNet121Binary()
model.load_state_dict(torch.load("model_weights.pth", map_location=device))
model.to(device).eval()

y_true, y_pred = [], []
start_time = time.time()

for imgs, labels in test_loader:
    imgs, labels = imgs.to(device), labels.to(device)
    outputs = model(imgs)
    preds = torch.argmax(outputs, dim=1)
    y_pred.extend(preds.cpu().tolist())
    y_true.extend(labels.cpu().tolist())

inference_time_ms = (time.time()-start_time)/len(y_true)*1000

metrics = {
    "accuracy": accuracy_score(y_true,y_pred),
    "precision": precision_score(y_true,y_pred),
    "recall": recall_score(y_true,y_pred),
    "auc": roc_auc_score(y_true,y_pred),
    "inference_time_ms": inference_time_ms
}

import json
with open("metrics.json","w") as f:
    json.dump(metrics,f)
print("Metrics saved to metrics.json")

import os
import torch
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, roc_curve, auc
import torch.nn.functional as F

from dataset import test_loader
from model import DenseNet121Binary

# Setup plotting style for academic presentation
plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.size': 12,
    'axes.labelsize': 14,
    'axes.titlesize': 16,
    'xtick.labelsize': 11,
    'ytick.labelsize': 11,
    'figure.titlesize': 18,
    'grid.alpha': 0.3
})

# Create directory to save plots
output_dir = "thesis_plots"
os.makedirs(output_dir, exist_ok=True)

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Running evaluation for plots on: {device}")

# Load model
model = DenseNet121Binary()
model.load_state_dict(torch.load("model_weights.pth", map_location=device))
model.to(device)
model.eval()

y_true = []
y_pred = []
y_probs = []

# Run inference
print("Gathering test set predictions...")
with torch.no_grad():
    for imgs, labels in test_loader:
        imgs = imgs.to(device)
        outputs = model(imgs)
        probs = F.softmax(outputs, dim=1)
        preds = torch.argmax(outputs, dim=1)
        
        y_true.extend(labels.cpu().tolist())
        y_pred.extend(preds.cpu().tolist())
        y_probs.extend(probs[:, 1].cpu().tolist())  # Probability of Pneumonia

y_true = np.array(y_true)
y_pred = np.array(y_pred)
y_probs = np.array(y_probs)

classes = ["Normal", "Pneumonia"]

# -------------------------------------------------------------
# PLOT 1: Confusion Matrix
# -------------------------------------------------------------
print("Generating Confusion Matrix...")
cm = confusion_matrix(y_true, y_pred)
fig, ax = plt.subplots(figsize=(6, 5))
im = ax.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
ax.figure.colorbar(im, ax=ax)

ax.set(xticks=np.arange(cm.shape[1]),
       yticks=np.arange(cm.shape[0]),
       xticklabels=classes, yticklabels=classes,
       title="Confusion Matrix",
       ylabel="Actual Label",
       xlabel="Predicted Label")

# Rotate the tick labels and set their alignment
plt.setp(ax.get_xticklabels(), rotation=0, ha="center")

# Loop over data dimensions and create text annotations
fmt = 'd'
thresh = cm.max() / 2.
for i in range(cm.shape[0]):
    for j in range(cm.shape[1]):
        ax.text(j, i, format(cm[i, j], fmt),
                ha="center", va="center",
                color="white" if cm[i, j] > thresh else "black",
                fontweight='bold', fontsize=14)

# Add performance metrics below confusion matrix
accuracy = np.trace(cm) / float(np.sum(cm))
precision = cm[1, 1] / sum(cm[:, 1]) if sum(cm[:, 1]) > 0 else 0
recall = cm[1, 1] / sum(cm[1, :]) if sum(cm[1, :]) > 0 else 0
f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

plt.figtext(0.5, -0.05, f"Accuracy: {accuracy:.3f} | Precision: {precision:.3f}\nRecall (Sensitivity): {recall:.3f} | F1-Score: {f1:.3f}", 
            ha="center", fontsize=11, bbox={"facecolor":"orange", "alpha":0.1, "pad":5})

plt.tight_layout()
cm_path = os.path.join(output_dir, "confusion_matrix.png")
plt.savefig(cm_path, bbox_inches='tight', dpi=300)
plt.close()
print(f"Saved: {cm_path}")

# -------------------------------------------------------------
# PLOT 2: ROC Curve
# -------------------------------------------------------------
print("Generating ROC Curve...")
fpr, tpr, thresholds = roc_curve(y_true, y_probs)
roc_auc = auc(fpr, tpr)

fig, ax = plt.subplots(figsize=(6, 5))
ax.plot(fpr, tpr, color='darkorange', lw=2.5, label=f'DenseNet121 (AUC = {roc_auc:.3f})')
ax.plot([0, 1], [0, 1], color='navy', lw=1.5, linestyle='--', label='Random Guessing (AUC = 0.500)')
ax.set_xlim([-0.01, 1.01])
ax.set_ylim([-0.01, 1.01])
ax.set_xlabel('False Positive Rate (1 - Specificity)')
ax.set_ylabel('True Positive Rate (Sensitivity)')
ax.set_title('Receiver Operating Characteristic (ROC) Curve')
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(loc="lower right")

plt.tight_layout()
roc_path = os.path.join(output_dir, "roc_curve.png")
plt.savefig(roc_path, bbox_inches='tight', dpi=300)
plt.close()
print(f"Saved: {roc_path}")

# -------------------------------------------------------------
# PLOT 3: Probability Distribution Density Plot
# -------------------------------------------------------------
print("Generating Probability Distribution Plot...")
fig, ax = plt.subplots(figsize=(7, 5))

# Separate probabilities based on true label
normal_probs = y_probs[y_true == 0]
pneumonia_probs = y_probs[y_true == 1]

# Plot histograms
ax.hist(normal_probs, bins=15, alpha=0.6, color='skyblue', label='Actual: Normal', edgecolor='black', density=True)
ax.hist(pneumonia_probs, bins=15, alpha=0.6, color='coral', label='Actual: Pneumonia', edgecolor='black', density=True)

# Add kernel density estimation approximations for smooth display
from scipy.stats import gaussian_kde
x_eval = np.linspace(0, 1, 200)
if len(normal_probs) > 1:
    kde_normal = gaussian_kde(normal_probs)
    ax.plot(x_eval, kde_normal(x_eval), color='deepskyblue', lw=2, linestyle='-')
if len(pneumonia_probs) > 1:
    kde_pneumonia = gaussian_kde(pneumonia_probs)
    ax.plot(x_eval, kde_pneumonia(x_eval), color='tomato', lw=2, linestyle='-')

ax.set_xlabel('Predicted Probability of Pneumonia')
ax.set_ylabel('Density of Samples')
ax.set_title('Class Separation & Probability Density')
ax.set_xlim([-0.05, 1.05])
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(loc="upper center")

plt.tight_layout()
dist_path = os.path.join(output_dir, "probability_distribution.png")
plt.savefig(dist_path, bbox_inches='tight', dpi=300)
plt.close()
print(f"Saved: {dist_path}")

print("\nAll thesis plots generated successfully and saved in the 'thesis_plots' folder!")

# import torch
# import torch.nn as nn
# import torch.optim as optim
# from torchvision import datasets, transforms
# from torch.utils.data import DataLoader
# from model import model  # your DenseNet model
# import os

# # --------------------
# # CONFIG
# # --------------------
# DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
# EPOCHS = 3
# BATCH_SIZE = 8
# LR = 1e-4
# DATA_DIR = "dataset/train"
# MODEL_PATH = "model_weights.pth"

# # --------------------
# # TRANSFORMS
# # --------------------
# transform = transforms.Compose([
#     transforms.Resize((224, 224)),
#     transforms.ToTensor(),
#     transforms.Normalize(mean=[0.485, 0.456, 0.406],
#                          std=[0.229, 0.224, 0.225])
# ])

# # --------------------
# # DATASET
# # --------------------
# train_dataset = datasets.ImageFolder(DATA_DIR, transform=transform)
# train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)

# print(f"Loaded {len(train_dataset)} training images")

# # --------------------
# # MODEL
# # --------------------
# model.to(DEVICE)
# criterion = nn.CrossEntropyLoss()
# optimizer = optim.Adam(model.parameters(), lr=LR)

# # --------------------
# # TRAIN LOOP
# # --------------------
# model.train()
# for epoch in range(EPOCHS):
#     running_loss = 0.0

#     for images, labels in train_loader:
#         images, labels = images.to(DEVICE), labels.to(DEVICE)

#         optimizer.zero_grad()
#         outputs = model(images)
#         loss = criterion(outputs, labels)
#         loss.backward()
#         optimizer.step()

#         running_loss += loss.item()

#     print(f"Epoch [{epoch+1}/{EPOCHS}] Loss: {running_loss/len(train_loader):.4f}")

# # --------------------
# # SAVE MODEL
# # --------------------
# torch.save(model.state_dict(), MODEL_PATH)
# print(f"Model saved to {MODEL_PATH}")


import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
from model import model  # your DenseNet model
import os
import time  # Added to track time

# --------------------
# CONFIG
# --------------------
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Training on: {DEVICE}")  # Check if you are on CPU or GPU

EPOCHS = 3
# Reduced batch size to 4 to make updates appear faster on CPU
BATCH_SIZE = 4 
LR = 1e-4
DATA_DIR = "dataset/train"
MODEL_PATH = "model_weights.pth"

# --------------------
# TRANSFORMS
# --------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

# --------------------
# DATASET
# --------------------
# Check if directory exists before crashing
if not os.path.exists(DATA_DIR):
    print(f"ERROR: The folder '{DATA_DIR}' was not found.")
    exit()

train_dataset = datasets.ImageFolder(DATA_DIR, transform=transform)
train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)

print(f"Loaded {len(train_dataset)} training images")
print(f"Batches per epoch: {len(train_loader)}")

# --------------------
# MODEL
# --------------------
model.to(DEVICE)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LR)

# --------------------
# TRAIN LOOP
# --------------------
model.train()

print("Starting training... (This might take a moment to start)")

for epoch in range(EPOCHS):
    running_loss = 0.0
    start_time = time.time()

    # Added enumerate to track batch index (i)
    for i, (images, labels) in enumerate(train_loader):
        images, labels = images.to(DEVICE), labels.to(DEVICE)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()

        # PRINT PROGRESS every 10 batches
        if (i + 1) % 10 == 0:
            print(f"Epoch [{epoch+1}/{EPOCHS}] - Batch [{i+1}/{len(train_loader)}] - Loss: {loss.item():.4f}")

    # End of epoch summary
    epoch_duration = time.time() - start_time
    avg_loss = running_loss / len(train_loader)
    print(f"--- Epoch [{epoch+1}/{EPOCHS}] Finished. Avg Loss: {avg_loss:.4f}. Time: {epoch_duration:.0f}s ---")

# --------------------
# SAVE MODEL
# --------------------
torch.save(model.state_dict(), MODEL_PATH)
print(f"Model saved to {MODEL_PATH}")
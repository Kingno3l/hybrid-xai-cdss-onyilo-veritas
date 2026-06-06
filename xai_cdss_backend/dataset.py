import os
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import torchvision.transforms as transforms

# Transform for resizing & normalization
transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
])

class XrayDataset(Dataset):
    def __init__(self, folder, transform=None):
        self.files = []
        self.labels = []
        self.transform = transform
        for label, cls in enumerate(["Normal", "Pneumonia"]):
            cls_folder = os.path.join(folder, cls)
            if not os.path.exists(cls_folder):
                cls_folder = os.path.join(folder, cls.upper())
            if not os.path.exists(cls_folder):
                cls_folder = os.path.join(folder, cls.lower())
                
            if os.path.exists(cls_folder):
                for f in os.listdir(cls_folder):
                    # Ignore hidden files (e.g. .DS_Store)
                    if f.startswith('.'):
                        continue
                    self.files.append(os.path.join(cls_folder, f))
                    self.labels.append(label)

    def __len__(self):
        return len(self.files)

    def __getitem__(self, idx):
        img = Image.open(self.files[idx]).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, self.labels[idx]

# Create DataLoaders
train_loader = DataLoader(XrayDataset("dataset/train", transform=transform), batch_size=16, shuffle=True)
val_loader   = DataLoader(XrayDataset("dataset/val", transform=transform), batch_size=16)
test_loader  = DataLoader(XrayDataset("dataset/test", transform=transform), batch_size=16)

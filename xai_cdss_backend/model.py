import torch
import torch.nn as nn
from torchvision import models

class DenseNet121Binary(nn.Module):
    def __init__(self):
        super().__init__()
        self.model = models.densenet121(weights=models.DenseNet121_Weights.IMAGENET1K_V1)
        self.model.classifier = nn.Linear(self.model.classifier.in_features, 2)  # binary classifier

    def forward(self, x):
        return self.model(x)

model = DenseNet121Binary()

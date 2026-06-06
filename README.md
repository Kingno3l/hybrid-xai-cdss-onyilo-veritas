---
title: Hybrid XAI CDSS Backend
emoji: 🫁
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# Hybrid Explainable AI Clinical Decision Support System (XAI-CDSS)

This repository contains the production-ready implementation of a **Hybrid Explainable AI Clinical Decision Support System (XAI-CDSS)** for Chest X-ray Pneumonia detection.

## 🚀 System Architecture

1. **Backend**: FastAPI web service running a fine-tuned DenseNet121 model. It provides real-time diagnostic predictions, Grad-CAM overlays, and 4-layer intrinsic activation maps.
2. **Frontend**: Interactive React (Vite) application styled with Tailwind CSS, featuring diagnostic charts, upload interfaces, and explainability carousels.

## 📦 Cloud Hosting Setup

* **Backend**: Hosted on Hugging Face Spaces (via Docker container).
* **Frontend**: Hosted on Vercel.

FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY xai_cdss_backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend application code
COPY xai_cdss_backend/ .

# Hugging Face Spaces runs apps on port 7860 by default
EXPOSE 7860

# Run uvicorn on host 0.0.0.0 and port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]

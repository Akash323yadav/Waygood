# Stage 1: Build
FROM python:3.9-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Production
FROM python:3.9-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .

# Update path
ENV PATH=/root/.local/bin:$PATH

# Create non-root user
RUN useradd -m appuser
USER appuser

CMD ["python", "main.py"]

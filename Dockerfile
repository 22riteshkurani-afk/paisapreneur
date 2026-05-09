# --- Frontend build stage ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/postcss.config.js frontend/tailwind.config.js frontend/vite.config.js ./
COPY frontend/src ./src
COPY frontend/index.html ./
RUN npm install && npm run build

# --- Backend runtime stage ---
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

COPY backend ./backend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8000
CMD ["gunicorn", "backend.app:app", "--bind", "0.0.0.0:8000", "--workers", "4"]

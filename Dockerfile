FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set working directory to backend so Python module resolution works natively
WORKDIR /app/backend

# Expose port for the FastAPI server
EXPOSE 8000

# Run the FastAPI server which also statically serves the built React frontend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

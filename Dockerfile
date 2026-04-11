# ── Image de base légère Python 3.11 ──────────────────────────────────────────
FROM python:3.11-slim

# Empêche la création de fichiers .pyc et force les logs en temps réel
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Copie et installation des dépendances en premier (cache Docker optimisé)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code applicatif
COPY app/ ./app/

# Cloud Run injecte automatiquement $PORT (défaut 8080)
ENV PORT=8080
EXPOSE 8080

# Lancement d'uvicorn sur toutes les interfaces au port $PORT
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]

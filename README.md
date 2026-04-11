# Mini API ESME — FastAPI sur GCP Cloud Run

## 1. Description du projet

Projet pédagogique réalisé dans le cadre du cours Cloud & DevOps à l'**ESME Sudria**.  
L'objectif est de concevoir, conteneuriser et déployer une API REST avec Python/FastAPI sur **Google Cloud Run**, en exploitant deux services GCP :

- **Google Cloud Storage (GCS)** pour la persistance de données JSON
- **Vertex AI (Gemini)** pour la génération de contenu avec un LLM

---

## 2. Architecture

```
                         ┌─────────────────────────────────────────┐
                         │            Google Cloud Platform         │
                         │                                          │
  Client HTTP  ────────► │  Cloud Run (conteneur FastAPI)           │
  (curl / browser)       │       │              │                   │
                         │       ▼              ▼                   │
                         │  Cloud Storage   Vertex AI (Gemini)      │
                         │  (entries.json)  (génération poème)      │
                         └─────────────────────────────────────────┘
```

---

## 3. Stack technique

| Composant       | Technologie                          |
|-----------------|--------------------------------------|
| Langage         | Python 3.11                          |
| Framework API   | FastAPI + Uvicorn                    |
| Conteneur       | Docker (python:3.11-slim)            |
| Déploiement     | GCP Cloud Run                        |
| Stockage        | Google Cloud Storage                 |
| IA générative   | Vertex AI — Gemini 1.5 Flash         |
| Tests           | pytest + TestClient                  |

---

## 4. Répartition des rôles équipe

| Membre    | Branche Git                    | Responsabilité                                      |
|-----------|-------------------------------|------------------------------------------------------|
| Axel   | `feature/endpoints-base`      | Routes `/hello`, `/status` + structure du projet     |
| [Axel  | `feature/gcs-integration`     | Service GCS (`gcs_service.py`) + routes `/data`      |
| Mathis   | `feature/vertex-poem`         | Service Vertex AI (`vertex_service.py`) + route `/poem` |
| Mathis   | `feature/docker-deploy`       | Dockerfile, `.dockerignore`, déploiement Cloud Run   |

---

## 5. Prérequis

- **gcloud CLI** installé et configuré (`gcloud auth login`)
- **Docker** installé localement
- Un **compte GCP** avec facturation activée
- APIs GCP activées sur votre projet :
  ```bash
  gcloud services enable run.googleapis.com \
    storage.googleapis.com \
    aiplatform.googleapis.com \
    cloudbuild.googleapis.com
  ```
- Un **compte de service** GCP avec les rôles :
  - `roles/storage.objectAdmin`
  - `roles/aiplatform.user`

---

## 6. Installation locale

```bash
# Cloner le dépôt
git clone <URL_DU_REPO>
cd mini-api-gcp

# Créer et activer l'environnement virtuel
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# Installer les dépendances
pip install -r requirements.txt

# Copier et remplir le fichier d'environnement
cp .env.example .env
# Éditez .env avec vos valeurs GCP
```

---

## 7. Exécution locale

```bash
uvicorn app.main:app --reload --port 8080
```

Documentation interactive disponible sur : http://localhost:8080/docs

### Lancer les tests

```bash
pytest tests/ -v
```

---

## 8. Build Docker local

```bash
# Build de l'image
docker build -t mini-api-gcp:local .

# Lancement avec les variables d'environnement
docker run -p 8080:8080 \
  -e GOOGLE_APPLICATION_CREDENTIALS=/tmp/sa.json \
  -e GCP_PROJECT_ID=mon-projet \
  -e GCP_REGION=europe-west1 \
  -e BUCKET_NAME=mon-bucket \
  -e FILE_PATH=data/entries.json \
  -v /chemin/local/sa.json:/tmp/sa.json:ro \
  mini-api-gcp:local
```

---

## 9. Déploiement sur Cloud Run

### 9.1 Build et push via Cloud Build

```bash
export PROJECT_ID=$(gcloud config get-value project)
export REGION=europe-west1
export SERVICE_NAME=mini-api-gcp
export IMAGE=gcr.io/$PROJECT_ID/$SERVICE_NAME

# Build et push de l'image dans Google Container Registry
gcloud builds submit --tag $IMAGE .
```

### 9.2 Déploiement du service Cloud Run

```bash
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --service-account <SA_EMAIL> \
  --set-env-vars GCP_PROJECT_ID=$PROJECT_ID,GCP_REGION=$REGION,BUCKET_NAME=<BUCKET>,FILE_PATH=data/entries.json \
  --port 8080
```

> **Note :** Sur Cloud Run, les identifiants GCP sont injectés automatiquement via le compte de service attaché. Pas besoin de `GOOGLE_APPLICATION_CREDENTIALS`.

---

## 10. Documentation des endpoints

### `GET /hello`
```bash
curl https://<CLOUD_RUN_URL>/hello
# {"message":"Bienvenue sur l'API mini-projet ESME"}
```

### `GET /status`
```bash
curl https://<CLOUD_RUN_URL>/status
# {"server_time":"2025-04-11T10:23:45.123456+00:00"}
```

### `GET /data`
```bash
curl https://<CLOUD_RUN_URL>/data
# [] ou [{"name":"Alice","score":42}, ...]
```

### `POST /data`
```bash
curl -X POST https://<CLOUD_RUN_URL>/data \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "score": 42}'
# {"status":"ok","added":{"name":"Alice","score":42}}
```

### `GET /poem`
```bash
curl https://<CLOUD_RUN_URL>/poem
# {"poem":"Dans les nuages de bits et d'octets...\n..."}
```

---

## 11. Liens utiles

| Ressource          | URL                          |
|--------------------|------------------------------|
| Cloud Run Service  | `<CLOUD_RUN_URL>`            |
| Docker Hub Image   | `<DOCKER_HUB_URL>`           |
| Swagger UI (local) | http://localhost:8080/docs   |
| ReDoc (local)      | http://localhost:8080/redoc  |

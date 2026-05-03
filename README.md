# Mini API ESME — FastAPI + React sur GCP Cloud Run

Projet pédagogique réalisé dans le cadre du cours Cloud & DevOps à l'**ESME Sudria**.  
API REST Python/FastAPI déployée sur Google Cloud Run, avec stockage GCS et génération de poèmes via Vertex AI (Gemini). Bonus : frontend React dockerisé et déployé sur Cloud Run.

---

## Liens du projet

| Ressource | URL |
|-----------|-----|
| **API en production (Cloud Run)** | https://mini-api-esme-454538766395.europe-west1.run.app |
| **Documentation Swagger** | https://mini-api-esme-454538766395.europe-west1.run.app/docs |
| **Image Docker (Artifact Registry GCP)** | `europe-west1-docker.pkg.dev/rise-connect-8407a/cloud-run-source-deploy/mini-api-esme` |
| **Repo GitHub** | https://github.com/AxelRemillat/repertoire-git-Tools-big-data |

---

## Architecture

```
  Navigateur ──► Frontend (React/Vite)
                     │
                     ▼
              Cloud Run — API FastAPI
                  │              │
                  ▼              ▼
          Cloud Storage    Vertex AI (Gemini)
          (entries.json)   (génération poème)
```

---

## Stack technique

| Composant     | Technologie                      |
|---------------|----------------------------------|
| Backend       | Python 3.11 · FastAPI · Uvicorn  |
| Frontend      | React 18 · TypeScript · Vite · Tailwind CSS |
| Conteneur     | Docker (python:3.11-slim / nginx:alpine) |
| Déploiement   | GCP Cloud Run + Cloud Build      |
| Stockage      | Google Cloud Storage             |
| IA générative | Vertex AI — Gemini 2.0 Flash     |
| Tests         | pytest + TestClient              |

---

## Répartition des rôles

### Axel Remillat
- Architecture et squelette FastAPI initial
- Implémentation des 5 endpoints (`/hello`, `/status`, `/data` GET+POST, `/poem`)
- Service GCS (`gcs_service.py`) — lecture/écriture JSON dans le bucket
- Service Vertex AI (`vertex_service.py`) — génération de poème via Gemini
- Création du Dockerfile backend et du `.dockerignore`
- Tests unitaires (`tests/test_endpoints.py`)
- Développement du frontend React (composants, UI, intégration API)
- Dockerfile frontend (multi-stage build nginx)

### Mathis Levrot
- Configuration complète de l'infrastructure GCP :
  - Activation des APIs (Vertex AI, Cloud Storage, Cloud Run, Cloud Build, Artifact Registry)
  - Création du bucket GCS `rise-connect-mini-api-mathis` (région `europe-west1`)
  - Initialisation du fichier `data/entries.json` dans le bucket
  - Compte de service `mini-api-sa` avec rôles IAM (`storage.objectAdmin`, `aiplatform.user`)
- Correction du service Vertex AI (modèle `gemini-2.0-flash-001`, région `us-central1`)
- Déploiement de l'API sur Cloud Run via Cloud Build
- Mise à jour `.gitignore` et documentation README

---

## Endpoints de l'API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/hello` | Message de bienvenue |
| GET | `/status` | Date/heure du serveur UTC |
| GET | `/data` | Lit `data/entries.json` depuis GCS |
| POST | `/data` | Ajoute une entrée JSON dans GCS |
| GET | `/poem` | Génère un poème via Vertex AI (Gemini) |

### Exemples curl (API déployée)

```bash
curl https://mini-api-esme-454538766395.europe-west1.run.app/hello
curl https://mini-api-esme-454538766395.europe-west1.run.app/status
curl https://mini-api-esme-454538766395.europe-west1.run.app/data
curl -X POST https://mini-api-esme-454538766395.europe-west1.run.app/data \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "score": 42}'
curl https://mini-api-esme-454538766395.europe-west1.run.app/poem
```

---

## Exécution locale

### Pré-requis

- Python 3.11+
- Node.js 18+
- Un fichier JSON de compte de service GCP avec les rôles `storage.objectAdmin` et `aiplatform.user`

### 1. Cloner le dépôt

```bash
git clone https://github.com/AxelRemillat/repertoire-git-Tools-big-data.git
cd repertoire-git-Tools-big-data
```

### 2. Configurer les variables d'environnement

Copier le fichier exemple et le remplir avec vos propres valeurs :

```bash
cp .env.example .env
```

Éditer `.env` :

```env
GOOGLE_APPLICATION_CREDENTIALS=/chemin/absolu/vers/votre-service-account.json
GCP_PROJECT_ID=rise-connect-8407a
GCP_REGION=europe-west1
BUCKET_NAME=rise-connect-mini-api-mathis
FILE_PATH=data/entries.json
```

> Le fichier JSON du compte de service s'obtient depuis la Console GCP :
> **IAM & Admin → Comptes de service → Clés → Ajouter une clé → JSON**

### 3. Lancer le backend

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API disponible sur http://localhost:8000/docs

### 4. Lancer le frontend

Le frontend se connecte par défaut à l'**API déployée sur Cloud Run** — aucune configuration supplémentaire n'est nécessaire.

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible sur http://localhost:5173

> Pour pointer vers un backend local, créer `frontend/.env.local` :
> ```env
> VITE_API_URL=http://localhost:8000
> ```

### 5. Tests

```bash
pytest tests/ -v
```

---

## Build et lancement Docker (backend)

```bash
# Build
docker build -t mini-api-esme:local .

# Lancement (monter le fichier de credentials en volume)
docker run -p 8080:8080 \
  -e GCP_PROJECT_ID=rise-connect-8407a \
  -e GCP_REGION=europe-west1 \
  -e BUCKET_NAME=rise-connect-mini-api-mathis \
  -e FILE_PATH=data/entries.json \
  -e GOOGLE_APPLICATION_CREDENTIALS=/tmp/sa.json \
  -v /chemin/vers/service-account.json:/tmp/sa.json:ro \
  mini-api-esme:local
```

API disponible sur http://localhost:8080/docs

---

## Build et lancement Docker (frontend)

```bash
cd frontend

# Build (pointe vers l'API Cloud Run par défaut)
docker build -t mini-api-esme-frontend:local .

# Lancement
docker run -p 8080:8080 mini-api-esme-frontend:local
```

Frontend disponible sur http://localhost:8080

> Pour pointer vers une API locale :
> ```bash
> docker build --build-arg VITE_API_URL=http://localhost:8000 -t mini-api-esme-frontend:local .
> ```

---

## Déploiement sur Cloud Run

### Backend

```bash
gcloud run deploy mini-api-esme \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --service-account mini-api-sa@rise-connect-8407a.iam.gserviceaccount.com \
  --set-env-vars BUCKET_NAME=rise-connect-mini-api-mathis,FILE_PATH=data/entries.json,GCP_PROJECT_ID=rise-connect-8407a,GCP_REGION=europe-west1
```

> Sur Cloud Run, les identifiants GCP sont injectés automatiquement via le compte de service — `GOOGLE_APPLICATION_CREDENTIALS` n'est pas nécessaire.

### Frontend

```bash
cd frontend
gcloud run deploy mini-api-esme-frontend \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated
```

---

## Configuration GCP

| Élément | Valeur |
|---------|--------|
| Project ID | `rise-connect-8407a` |
| Région principale | `europe-west1` |
| Bucket GCS | `rise-connect-mini-api-mathis` |
| Compte de service | `mini-api-sa@rise-connect-8407a.iam.gserviceaccount.com` |
| Région Vertex AI | `us-central1` |
| Modèle LLM | `gemini-2.0-flash-001` |

---

## Sécurité

- Le fichier de compte de service (`.json`) est exclu du dépôt via `.gitignore`
- Le fichier `.env` n'est jamais commité
- Le compte de service respecte le principe du moindre privilège (`storage.objectAdmin` + `aiplatform.user` uniquement)

---

> **Note sur l'image Docker** : conformément aux pratiques GCP recommandées, l'image est stockée sur **Google Artifact Registry** (intégré nativement à Cloud Run et Cloud Build) plutôt que sur Docker Hub. Le build et le push sont automatisés par `gcloud run deploy --source .`.

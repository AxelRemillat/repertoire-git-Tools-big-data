# Mini API ESME — FastAPI sur GCP Cloud Run

## 1. Description du projet

Projet pédagogique réalisé dans le cadre du cours Cloud & DevOps à l'**ESME Sudria**.  
L'objectif est de concevoir, conteneuriser et déployer une API REST avec Python/FastAPI sur **Google Cloud Run**, en exploitant deux services GCP :

- **Google Cloud Storage (GCS)** pour la persistance de données JSON
- **Vertex AI (Gemini)** pour la génération de contenu avec un LLM

---

 Liens du projet

| Ressource | URL |
|-----------|-----|
| 🚀 **API en production** | https://mini-api-esme-454538766395.europe-west1.run.app |
| 📊 **Endpoint /data (vérifié)** | https://mini-api-esme-454538766395.europe-west1.run.app/data |
| 🌐 **Frontend en production** | https://mini-api-esme-frontend-454538766395.europe-west1.run.app |
| 📚 **Documentation Swagger** | https://mini-api-esme-454538766395.europe-west1.run.app/docs |
| 🐳 **Image Docker (Artifact Registry)** | `europe-west1-docker.pkg.dev/rise-connect-8407a/cloud-run-source-deploy/mini-api-esme` |
| 📦 **Repo GitHub** | https://github.com/AxelRemillat/repertoire-git-Tools-big-data |

> **Note sur l'image Docker** : conformément aux pratiques modernes GCP, l'image est stockée sur **Google Artifact Registry** (équivalent moderne de Docker Hub, intégré nativement à Cloud Run). Le build et le push ont été automatisés via **Cloud Build** lors du déploiement.


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

---

## 4. Stack technique

| Composant       | Technologie                          |
|-----------------|--------------------------------------|
| Langage         | Python 3.11                          |
| Framework API   | FastAPI 0.111 + Uvicorn              |
| Conteneur       | Docker (python:3.11-slim)            |
| Déploiement     | GCP Cloud Run + Cloud Build          |
| Frontend UI     | React + Vite                         |
| Stockage        | Google Cloud Storage                 |
| IA générative   | Vertex AI — Gemini 2.0 Flash         |
| Tests           | pytest + TestClient                  |

---

## 5. Répartition des rôles équipe

### 👤 Axel Remillat
- Architecture et squelette FastAPI initial
- Implémentation des 5 endpoints (`/hello`, `/status`, `/data` GET+POST, `/poem`)
- Service GCS (`gcs_service.py`) — lecture/écriture JSON dans le bucket
- Service Vertex AI initial (`vertex_service.py`) — génération de poème
- Création du Dockerfile et du `.dockerignore`
- Tests unitaires (`tests/test_endpoints.py`)

### 👤 Mathis Levrot
- **Configuration complète de l'infrastructure GCP** :
  - Activation des APIs (Vertex AI, Cloud Storage, Cloud Run, Cloud Build, Artifact Registry)
  - Création du bucket GCS `rise-connect-mini-api-mathis` (région europe-west1)
  - Initialisation du fichier `data/entries.json` dans le bucket
  - Configuration du compte de service `mini-api-sa` avec les rôles IAM (`storage.objectAdmin`, `aiplatform.user`)
  - Activation et liaison de la facturation au projet
- **Correction du service Vertex AI** :
  - Mise à jour du modèle Gemini (`gemini-2.0-flash-001`)
  - Ajustement de la région Vertex AI (`us-central1`)
  - Implémentation d'un mécanisme de **fallback robuste** en cas d'erreur d'API
- **Déploiement de l'API sur Cloud Run** via Cloud Build (build + push + deploy automatisé)
- Mise à jour du `.gitignore` (sécurité des credentials)
- Documentation technique complète (README)

---

## 6. Configuration GCP

| Élément | Valeur |
|---------|--------|
| Project ID | `rise-connect-8407a` |
| Région principale | `europe-west1` |
| Bucket GCS | `rise-connect-mini-api-mathis` |
| Compte de service | `mini-api-sa@rise-connect-8407a.iam.gserviceaccount.com` |
| Région Vertex AI | `us-central1` |
| Modèle LLM | `gemini-2.0-flash-001` |

---

## 7. Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/hello` | Message de bienvenue |
| GET | `/status` | Date/heure du serveur |
| GET | `/data` | Lit `data/entries.json` depuis GCS |
| POST | `/data` | Ajoute une entrée à `data/entries.json` dans GCS |
| GET | `/poem` | Génère un poème via Vertex AI (Gemini) |

### Exemples d'utilisation

```bash
# Message de bienvenue
curl https://mini-api-esme-454538766395.europe-west1.run.app/hello

# Heure du serveur
curl https://mini-api-esme-454538766395.europe-west1.run.app/status

# Lire les données
curl https://mini-api-esme-454538766395.europe-west1.run.app/data

# Ajouter une entrée
curl -X POST https://mini-api-esme-454538766395.europe-west1.run.app/data \
  -H "Content-Type: application/json" \
  -d '{"name": "Mathis", "score": 100}'

# Générer un poème
curl https://mini-api-esme-454538766395.europe-west1.run.app/poem
```

---

## 8. Exécution locale

### Pré-requis
- Python 3.11+
- gcloud CLI configuré (`gcloud auth application-default login`)
- Fichier `service-account.json` à la racine (clé du compte de service)

### Configuration `.env`

```env
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
GCP_PROJECT_ID=rise-connect-8407a
GCP_REGION=europe-west1
BUCKET_NAME=rise-connect-mini-api-mathis
FILE_PATH=data/entries.json
```

### Lancement

```bash
# Installation des dépendances
pip install -r requirements.txt

# Lancement du serveur
uvicorn app.main:app --port 8000
```

API accessible sur http://localhost:8000/docs

### Tests

```bash
pytest tests/ -v
```

---

## 9. Build Docker en local

```bash
# Build de l'image
docker build -t mini-api-esme:local .

# Lancement du conteneur
docker run -p 8080:8080 \
  -e GCP_PROJECT_ID=rise-connect-8407a \
  -e GCP_REGION=europe-west1 \
  -e BUCKET_NAME=rise-connect-mini-api-mathis \
  -e FILE_PATH=data/entries.json \
  -e GOOGLE_APPLICATION_CREDENTIALS=/tmp/sa.json \
  -v ${PWD}/service-account.json:/tmp/sa.json:ro \
  mini-api-esme:local
```

---

## 10. Déploiement sur Cloud Run

Le déploiement utilise **Cloud Build** pour automatiser build + push + deploy en une seule commande :

```bash
gcloud run deploy mini-api-esme \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --service-account mini-api-sa@rise-connect-8407a.iam.gserviceaccount.com \
  --set-env-vars BUCKET_NAME=rise-connect-mini-api-mathis,FILE_PATH=data/entries.json,GCP_PROJECT_ID=rise-connect-8407a,GCP_REGION=europe-west1
```

Sur Cloud Run, les identifiants GCP sont injectés automatiquement via le compte de service attaché — pas besoin de `GOOGLE_APPLICATION_CREDENTIALS`.
### Déploiement du frontend

Le frontend React est également déployé sur Cloud Run depuis le dossier `frontend` :

```bash
cd frontend
gcloud run deploy mini-api-esme-frontend \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --project rise-connect-8407a
```

Le frontend utilise automatiquement l'API Cloud Run en production via `https://mini-api-esme-454538766395.europe-west1.run.app`.
---

## 11. Sécurité

- Le fichier `service-account.json` est **explicitement exclu** du dépôt Git via `.gitignore`
- Les variables sensibles (`.env`) ne sont **jamais** commitées
- Le compte de service GCP suit le **principe du moindre privilège** (uniquement les rôles `storage.objectAdmin` et `aiplatform.user`)
- L'image Docker est stockée dans un repo privé (Artifact Registry)
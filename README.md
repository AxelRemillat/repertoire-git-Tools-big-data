# Mini API ESME — FastAPI + React sur GCP Cloud Run

Projet pédagogique réalisé dans le cadre du cours Cloud & DevOps à l'**ESME Sudria**.  
API REST Python/FastAPI déployée sur Google Cloud Run, avec stockage des données dans Google Cloud Storage et génération de poèmes via Vertex AI (Gemini). Bonus : frontend React déployé sur Cloud Run.

---

## Liens du projet

| Ressource | URL |
|-----------|-----|
| **Frontend (Cloud Run)** | https://mini-api-esme-frontend-454538766395.europe-west1.run.app |
| **API en production (Cloud Run)** | https://mini-api-esme-454538766395.europe-west1.run.app |
| **Documentation Swagger** | https://mini-api-esme-454538766395.europe-west1.run.app/docs |
| **Image (Artifact Registry GCP)** | `europe-west1-docker.pkg.dev/rise-connect-8407a/cloud-run-source-deploy/mini-api-esme` |
| **Repo GitHub** | https://github.com/AxelRemillat/repertoire-git-Tools-big-data |

---

## Architecture

```
  Navigateur ──► Frontend React (Cloud Run)
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

| Composant     | Technologie                          |
|---------------|--------------------------------------|
| Backend       | Python 3.11 · FastAPI · Uvicorn      |
| Frontend      | React 18 · TypeScript · Vite · Tailwind CSS |
| Déploiement   | GCP Cloud Run + Cloud Build          |
| Stockage      | Google Cloud Storage                 |
| IA générative | Vertex AI — Gemini 2.0 Flash         |
| Tests         | pytest + TestClient                  |

---

## Répartition des rôles

### Axel Remillat
- Structure initiale du projet FastAPI (squelette, endpoints, organisation des fichiers)
- Développement du frontend React : composants, intégration des 5 endpoints, affichage des données
- Correction frontend : heure serveur lue depuis `/status` (UTC), validation du formulaire avant envoi
- Préparation du déploiement Cloud Run pour le frontend (configuration nginx et build)
- Tests unitaires supplémentaires : redirect `/` et comportement d'ajout `POST /data`
- Documentation README : instructions locales, déploiement Cloud Run, stockage GCP

### Mathis Levrot
- Configuration de l'infrastructure GCP : activation des APIs (Vertex AI, Cloud Storage, Cloud Run, Cloud Build, Artifact Registry), création du bucket GCS `rise-connect-mini-api-mathis`, compte de service `mini-api-sa` avec rôles IAM (`storage.objectAdmin`, `aiplatform.user`)
- Correction service Vertex AI : modèle `gemini-2.0-flash-001`, région `us-central1`, poème de secours en cas d'erreur
- Activation du middleware CORS pour la communication frontend ↔ API
- Correction du bug `POST /data` : les nouvelles entrées s'ajoutent sans écraser les données existantes dans GCS
- Ajout des fichiers de configuration frontend (Tailwind, PostCSS, TypeScript)
- Nettoyage du code frontend (suppression éléments de debug)
- Déploiement de l'API sur Cloud Run via Cloud Build
- Documentation README avec liens Cloud Run

---

## Endpoints de l'API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/hello` | Message de bienvenue |
| GET | `/status` | Date/heure du serveur UTC |
| GET | `/data` | Lit `data/entries.json` depuis Google Cloud Storage |
| POST | `/data` | Ajoute une entrée JSON dans Google Cloud Storage |
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

```bash
cp .env.example .env
```

Éditer `.env` avec vos valeurs :

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

## Déploiement sur Cloud Run

Le déploiement utilise `gcloud run deploy --source .` : Cloud Build construit et publie l'image automatiquement sur Artifact Registry, puis déploie le service sur Cloud Run.

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

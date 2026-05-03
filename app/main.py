"""
Point d'entrée FastAPI — routes principales de l'API mini-projet ESME.
"""
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv(override=True)

from app.gcs_service import read_json_from_gcs, write_json_to_gcs
from app.vertex_service import generate_poem

app = FastAPI(
    title="Mini API ESME",
    description="API FastAPI déployée sur GCP Cloud Run avec GCS et Vertex AI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/hello")
def hello():
    """Route de bienvenue."""
    return {"message": "Bienvenue sur l'API mini-projet ESME"}


@app.get("/status")
def status():
    """Retourne l'heure serveur en UTC."""
    return {"server_time": datetime.now(timezone.utc).isoformat()}


@app.get("/data")
def get_data():
    """
    Lit un fichier JSON (liste d'objets) depuis GCS.
    Retourne une liste vide si le fichier n'existe pas encore.
    """
    try:
        data = read_json_from_gcs()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return data


@app.post("/data")
def post_data(entry: dict):
    """
    Ajoute un objet JSON au fichier GCS.
    Crée le fichier si nécessaire.
    """
    try:
        updated = read_json_from_gcs()        # liste existante (ou [])
        updated.append(entry)
        write_json_to_gcs(updated)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return {"status": "ok", "added": entry}


@app.get("/poem")
def poem():
    """Génère un court poème en français via Vertex AI (Gemini)."""
    try:
        text = generate_poem()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return {"poem": text}

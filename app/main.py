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


def _as_list(raw) -> list:
    """Normalise le contenu GCS en liste, quel que soit le format stocké."""
    if isinstance(raw, list):
        return raw
    if isinstance(raw, dict):
        return raw.get("entries", [])
    return []


@app.get("/data")
def get_data():
    """Lit la liste d'entrées depuis GCS."""
    try:
        data = _as_list(read_json_from_gcs())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return data


@app.post("/data")
def post_data(entry: dict):
    """Ajoute une entrée JSON dans GCS."""
    try:
        entries = _as_list(read_json_from_gcs())
        entries.append(entry)
        write_json_to_gcs(entries)
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

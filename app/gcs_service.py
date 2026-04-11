"""
Service Google Cloud Storage — lecture et écriture d'un fichier JSON.

Variables d'environnement requises :
  BUCKET_NAME  — nom du bucket GCS
  FILE_PATH    — chemin de l'objet dans le bucket (ex: data/entries.json)
"""
import json
import os

from google.cloud import storage
from google.cloud.exceptions import NotFound

BUCKET_NAME = os.environ.get("BUCKET_NAME", "")
FILE_PATH = os.environ.get("FILE_PATH", "data/entries.json")


def _get_blob():
    """Retourne le blob GCS correspondant à FILE_PATH dans BUCKET_NAME."""
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    return bucket.blob(FILE_PATH)


def read_json_from_gcs() -> list:
    """
    Lit le fichier JSON depuis GCS et retourne son contenu (liste d'objets).
    Retourne une liste vide si le fichier n'existe pas.
    """
    blob = _get_blob()
    try:
        content = blob.download_as_text(encoding="utf-8")
        return json.loads(content)
    except NotFound:
        return []


def write_json_to_gcs(data: list) -> None:
    """
    Sérialise `data` en JSON et l'écrit (ou écrase) dans GCS.
    Crée le fichier s'il n'existe pas.
    """
    blob = _get_blob()
    blob.upload_from_string(
        json.dumps(data, ensure_ascii=False, indent=2),
        content_type="application/json",
    )

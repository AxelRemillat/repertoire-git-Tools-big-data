"""
Service Vertex AI — génération d'un poème en français via Gemini.

Variables d'environnement requises :
  GCP_PROJECT_ID — identifiant du projet GCP
  GCP_REGION     — région (défaut : europe-west1)
"""
import os

import vertexai
from vertexai.generative_models import GenerativeModel

GCP_PROJECT_ID = os.environ.get("GCP_PROJECT_ID", "")
GCP_REGION = os.environ.get("GCP_REGION", "europe-west1")

PROMPT = (
    "Écris un court poème original en français (4 à 8 vers) "
    "sur le thème du nuage et du code. Sois poétique et créatif."
)


def generate_poem() -> str:
    """
    Initialise Vertex AI, envoie le prompt à Gemini et retourne le texte généré.
    Lève une RuntimeError si la réponse est vide.
    """
    vertexai.init(project=GCP_PROJECT_ID, location="us-central1")

    model = GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(PROMPT)

    text = response.text.strip()
    if not text:
        raise RuntimeError("Vertex AI a retourné une réponse vide.")
    return text

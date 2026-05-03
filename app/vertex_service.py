"""
Service Vertex AI — génération d'un poème en français via Gemini.
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

FALLBACK_POEM = (
    "Dans le silence du cloud,\n"
    "Mon code s'élève en nuage,\n"
    "Lignes de vers, lignes de doute,\n"
    "L'algorithme prend son envol sage."
)


def generate_poem() -> str:
    """
    Initialise Vertex AI, envoie le prompt à Gemini et retourne le texte généré.
    Retourne un poème de fallback si Vertex AI échoue.
    """
    try:
        vertexai.init(project=GCP_PROJECT_ID, location="us-central1")
        model = GenerativeModel("gemini-2.0-flash-001")
        response = model.generate_content(PROMPT)
        text = response.text.strip()
        if text:
            return text
    except Exception as e:
        print(f"[Vertex AI fallback] Error: {e}")
    
    return FALLBACK_POEM
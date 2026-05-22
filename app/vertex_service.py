"""
Service de génération de poème en français via OpenAI GPT.

Variables d'environnement requises :
  OPENAI_API_KEY — clé API OpenAI
"""
import os
from openai import OpenAI

PROMPT = (
    "Écris un court poème original en français (4 à 8 vers) "
    "sur le thème du nuage et du code. Sois poétique et créatif. "
    "Varie le style à chaque génération."
)

FALLBACK_POEM = (
    "Dans le silence du cloud,\n"
    "Mon code s'élève en nuage,\n"
    "Lignes de vers, lignes de doute,\n"
    "L'algorithme prend son envol sage."
)


def generate_poem() -> str:
    try:
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": PROMPT}],
            temperature=1.2,
        )
        text = response.choices[0].message.content.strip()
        if text:
            return text
    except Exception as e:
        print(f"[OpenAI fallback] Error: {e}")

    return FALLBACK_POEM
import os
import random

PROMPT_THEMES = [
    "le nuage et le code",
    "l'intelligence artificielle et la nature",
    "les données qui voyagent",
    "un algorithme qui rêve",
    "le silence des serveurs",
]

def _build_prompt() -> str:
    theme = random.choice(PROMPT_THEMES)
    return (
        f"Écris un court poème original et unique en français (4 à 8 vers) "
        f"sur le thème : {theme}. Sois poétique, créatif et surprenant."
    )

FALLBACK_POEM = (
    "Dans le silence du cloud,\n"
    "Mon code s'élève en nuage,\n"
    "Lignes de vers, lignes de doute,\n"
    "L'algorithme prend son envol sage."
)


def _try_vertex() -> str | None:
    try:
        import vertexai
        from vertexai.generative_models import GenerativeModel

        project = os.environ.get("GCP_PROJECT_ID", "")
        if not project:
            return None

        vertexai.init(project=project, location="us-central1")
        model = GenerativeModel("gemini-2.0-flash-001")
        response = model.generate_content(_build_prompt())
        text = response.text.strip()
        return text if text else None
    except Exception as e:
        print(f"[Vertex AI] échec : {e}")
        return None


def _try_openai() -> str | None:
    try:
        from openai import OpenAI

        api_key = os.environ.get("OPENAI_API_KEY", "")
        if not api_key:
            return None

        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=os.environ.get("GENERATION_MODEL", "gpt-4o"),
            messages=[{"role": "user", "content": _build_prompt()}],
            max_tokens=300,
            temperature=1.0,
        )
        text = response.choices[0].message.content.strip()
        return text if text else None
    except Exception as e:
        print(f"[OpenAI] échec : {e}")
        return None


def generate_poem() -> str:
    poem = _try_vertex()
    if poem:
        print("[generate_poem] source : Vertex AI")
        return poem

    poem = _try_openai()
    if poem:
        print("[generate_poem] source : OpenAI")
        return poem

    print("[generate_poem] source : fallback statique")
    return FALLBACK_POEM

"""
Tests basiques des endpoints FastAPI avec pytest + TestClient.
Les appels GCS et Vertex AI sont mockés pour isoler la logique HTTP.
"""
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


# ──────────────────────────────────────────────
# GET / — redirect vers /docs
# ──────────────────────────────────────────────
def test_root_redirects_to_docs():
    resp = client.get("/", follow_redirects=False)
    assert resp.status_code == 307
    assert resp.headers["location"] == "/docs"


# ──────────────────────────────────────────────
# GET /hello
# ──────────────────────────────────────────────
def test_hello():
    resp = client.get("/hello")
    assert resp.status_code == 200
    assert resp.json() == {"message": "Bienvenue sur l'API mini-projet ESME"}


# ──────────────────────────────────────────────
# GET /status
# ──────────────────────────────────────────────
def test_status_has_server_time():
    resp = client.get("/status")
    assert resp.status_code == 200
    body = resp.json()
    assert "server_time" in body
    # Vérifie que c'est une chaîne ISO 8601 valide
    from datetime import datetime
    datetime.fromisoformat(body["server_time"])


# ──────────────────────────────────────────────
# GET /data
# ──────────────────────────────────────────────
def test_get_data_returns_list(monkeypatch):
    monkeypatch.setattr("app.main.read_json_from_gcs", lambda: [{"id": 1}])
    resp = client.get("/data")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_get_data_empty_when_file_missing(monkeypatch):
    monkeypatch.setattr("app.main.read_json_from_gcs", lambda: [])
    resp = client.get("/data")
    assert resp.status_code == 200
    assert resp.json() == []


def test_get_data_propagates_error(monkeypatch):
    monkeypatch.setattr("app.main.read_json_from_gcs", lambda: (_ for _ in ()).throw(Exception("GCS error")))
    resp = client.get("/data")
    assert resp.status_code == 500


# ──────────────────────────────────────────────
# POST /data
# ──────────────────────────────────────────────
def test_post_data_adds_entry(monkeypatch):
    monkeypatch.setattr("app.main.read_json_from_gcs", lambda: [])
    monkeypatch.setattr("app.main.write_json_to_gcs", lambda data: None)

    payload = {"name": "Alice", "score": 42}
    resp = client.post("/data", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["added"] == payload


def test_post_data_appends_to_existing(monkeypatch):
    existing = [{"name": "Bob", "score": 10}]
    written = []

    monkeypatch.setattr("app.main.read_json_from_gcs", lambda: list(existing))
    monkeypatch.setattr("app.main.write_json_to_gcs", lambda data: written.extend(data))

    client.post("/data", json={"name": "Alice", "score": 42})
    assert len(written) == 2
    assert written[0]["name"] == "Bob"
    assert written[1]["name"] == "Alice"


# ──────────────────────────────────────────────
# GET /poem
# ──────────────────────────────────────────────
def test_poem_returns_text(monkeypatch):
    monkeypatch.setattr("app.main.generate_poem", lambda: "Les octets dansent sous les nuages.")
    resp = client.get("/poem")
    assert resp.status_code == 200
    assert "poem" in resp.json()
    assert len(resp.json()["poem"]) > 0


def test_poem_propagates_error(monkeypatch):
    def _raise():
        raise RuntimeError("Vertex unavailable")
    monkeypatch.setattr("app.main.generate_poem", _raise)
    resp = client.get("/poem")
    assert resp.status_code == 500

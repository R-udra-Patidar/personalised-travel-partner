"""
Unit and integration tests for FastAPI backend core endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "ai_enabled" in data


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_create_and_get_trip():
    payload = {
        "title": "Summer in Tokyo",
        "destination": "Tokyo, Japan",
        "travel_vibe": "cultural",
        "budget_level": "moderate",
        "travel_days": 5,
        "traveler_type": "solo",
        "interests": ["food", "history"]
    }
    create_res = client.post("/api/v1/trips", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    trip_id = created["id"]
    assert created["destination"] == "Tokyo, Japan"

    # Get single trip
    get_res = client.get(f"/api/v1/trips/{trip_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == trip_id

    # List trips
    list_res = client.get("/api/v1/trips")
    assert list_res.status_code == 200
    trips = list_res.json()
    assert any(t["id"] == trip_id for t in trips)


def test_recommendations_endpoint():
    payload = {
        "travel_vibe": "cultural",
        "budget_level": "moderate",
        "travel_days": 7,
        "traveler_type": "couple",
        "interests": ["history", "food"]
    }
    res = client.post("/api/v1/recommendations", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) == 3
    for rec in data["recommendations"]:
        assert "name" in rec
        assert "country" in rec
        assert "short_description" in rec


def test_itinerary_generate_and_save():
    payload = {
        "destination": "Kyoto, Japan",
        "travel_vibe": "cultural",
        "budget_level": "moderate",
        "travel_days": 3,
        "traveler_type": "solo",
        "interests": ["temples", "tea"]
    }
    res = client.post("/api/v1/itinerary/generate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "days" in data
    assert len(data["days"]) == 3
    assert "budget_estimate" in data

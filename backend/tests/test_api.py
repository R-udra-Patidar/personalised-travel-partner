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


def test_regenerate_day_and_pdf_export():
    # 1. Create a trip
    trip_payload = {
        "title": "Kyoto Explorer",
        "destination": "Kyoto, Japan",
        "travel_vibe": "cultural",
        "budget_level": "moderate",
        "travel_days": 3,
        "traveler_type": "solo"
    }
    create_res = client.post("/api/v1/trips", json=trip_payload)
    assert create_res.status_code == 201
    trip_id = create_res.json()["id"]

    # 2. Generate and save itinerary
    gen_payload = {
        "destination": "Kyoto, Japan",
        "travel_vibe": "cultural",
        "budget_level": "moderate",
        "travel_days": 3,
        "trip_id": trip_id
    }
    gen_res = client.post("/api/v1/itinerary/generate", json=gen_payload)
    assert gen_res.status_code == 200

    # 3. Regenerate single day
    regen_res = client.post(
        f"/api/v1/itinerary/{trip_id}/day/2/regenerate",
        json={"reason": "User wanted more gardens"}
    )
    assert regen_res.status_code == 200
    assert "day" in regen_res.json()

    # 4. Test PDF export
    pdf_res = client.get(f"/api/v1/export/{trip_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 100


def test_replace_and_update_activity():
    # 1. Create a trip with an itinerary
    trip_payload = {
        "title": "Rome Weekend",
        "destination": "Rome, Italy",
        "travel_vibe": "cultural",
        "budget_level": "moderate",
        "travel_days": 2,
    }
    create_res = client.post("/api/v1/trips", json=trip_payload)
    trip_id = create_res.json()["id"]

    gen_res = client.post("/api/v1/itinerary/generate", json={
        "destination": "Rome, Italy",
        "travel_days": 2,
        "trip_id": trip_id
    })
    trip_data = gen_res.json()
    first_day = trip_data["days"][0]
    first_act = first_day["activities"][0]

    # 2. Test replace activity
    replace_res = client.post(f"/api/v1/itinerary/{trip_id}/activity/replace", json={
        "day_context": first_day,
        "activity_index": 0,
        "reason": "Looking for a pasta cooking class instead"
    })
    assert replace_res.status_code == 200
    replace_data = replace_res.json()
    assert "activity" in replace_data
    assert "name" in replace_data["activity"]

    # 3. Test update activity details
    act_id = first_act.get("id")
    if act_id:
        update_res = client.put(f"/api/v1/itinerary/{trip_id}/activity", json={
            "activity_id": act_id,
            "updates": {"name": "Colosseum Private Guided Tour", "estimated_cost_usd": 65.0}
        })
        assert update_res.status_code == 200
        assert update_res.json()["success"] is True


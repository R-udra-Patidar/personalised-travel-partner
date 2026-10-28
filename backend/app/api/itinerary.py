"""
Itinerary generation and manipulation endpoints.
"""
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.services import ai_service
from app.database import operations as db

router = APIRouter(prefix="/itinerary", tags=["Itinerary"])


class GenerateRequest(BaseModel):
    destination: str
    travel_vibe: str = "mixed"
    budget_level: str = "moderate"
    travel_days: int = Field(5, ge=1, le=30)
    traveler_type: str = "solo"
    interests: List[str] = []
    trip_id: Optional[str] = None


class RegenerateDayPayload(BaseModel):
    existing_days: List[Dict[str, Any]] = []
    reason: Optional[str] = "User requested a fresh schedule for this day"
    preferences: Optional[Dict[str, Any]] = None


class ReplaceActivityPayload(BaseModel):
    day_context: Dict[str, Any]
    activity_index: int = 0
    reason: Optional[str] = "User requested alternative activity"
    preferences: Optional[Dict[str, Any]] = None


class UpdateActivityPayload(BaseModel):
    activity_id: str
    updates: Dict[str, Any]


@router.post("/generate")
def generate_itinerary(payload: GenerateRequest) -> Dict[str, Any]:
    """
    Generate a full day-by-day itinerary with realistic activities and budget estimates.
    If trip_id is provided, automatically saves the generated itinerary to that trip.
    """
    prefs = payload.dict()
    result = ai_service.generate_itinerary(prefs)

    if payload.trip_id:
        db.save_full_itinerary(payload.trip_id, result)
        saved = db.get_trip(payload.trip_id)
        if saved:
            result["trip"] = saved

    return result


@router.post("/{trip_id}/day/{day_number}/regenerate")
def regenerate_day(trip_id: str, day_number: int, payload: RegenerateDayPayload) -> Dict[str, Any]:
    """
    Regenerate a single day without altering the rest of the trip.
    """
    trip = db.get_trip(trip_id)
    prefs = payload.preferences or (trip if trip else {"destination": "Travel Destination"})

    existing_days = payload.existing_days or (trip.get("days", []) if trip else [])
    result = ai_service.regenerate_day(prefs, day_number, existing_days, payload.reason or "")

    # If the trip exists in DB, update that day
    if trip and "days" in trip:
        for idx, d in enumerate(trip["days"]):
            if d.get("day_number") == day_number:
                trip["days"][idx] = {**d, **result.get("day", {})}
                db.save_full_itinerary(trip_id, {"days": trip["days"], "budget_estimate": trip.get("budget_estimate")})
                break

    return result


@router.post("/{trip_id}/activity/replace")
def replace_activity(trip_id: str, payload: ReplaceActivityPayload) -> Dict[str, Any]:
    """
    Generate an alternative activity for a single time slot.
    """
    trip = db.get_trip(trip_id)
    prefs = payload.preferences or (trip if trip else {})
    result = ai_service.replace_activity(prefs, payload.day_context, payload.activity_index, payload.reason or "")
    return result


@router.put("/{trip_id}/activity")
def update_activity(trip_id: str, payload: UpdateActivityPayload):
    """
    Directly edit an activity's details (title, time slot, cost, notes).
    """
    success = db.update_single_activity(payload.activity_id, payload.updates)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity {payload.activity_id} not found."
        )
    return {"success": True, "activity_id": payload.activity_id, "updated": payload.updates}

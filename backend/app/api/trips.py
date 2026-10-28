"""
Trip management API endpoints: Create, Read, Update, Delete, and Save Itinerary.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from app.database import operations as db

router = APIRouter(prefix="/trips", tags=["Trips"])


class CreateTripPayload(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = "Undecided"
    travel_vibe: str = "mixed"
    budget_level: str = "moderate"
    travel_days: int = 5
    start_date: Optional[str] = None
    num_travelers: Optional[int] = 1
    traveler_type: str = "solo"
    interests: List[str] = []
    is_demo: bool = False


class UpdateTripPayload(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = None
    travel_vibe: Optional[str] = None
    budget_level: Optional[str] = None
    travel_days: Optional[int] = None
    start_date: Optional[str] = None
    num_travelers: Optional[int] = None
    traveler_type: Optional[str] = None
    interests: Optional[List[str]] = None


class SaveItineraryPayload(BaseModel):
    days: List[Dict[str, Any]]
    budget_estimate: Optional[Dict[str, Any]] = None


@router.get("", response_model=List[Dict[str, Any]])
def get_all_trips():
    """Retrieve all saved trips."""
    return db.list_trips()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_new_trip(payload: CreateTripPayload):
    """Create a new trip record."""
    trip = db.create_trip(payload.dict())
    return trip


@router.get("/{trip_id}")
def get_single_trip(trip_id: str):
    """Retrieve a single trip by ID, including its days, activities, and budget."""
    trip = db.get_trip(trip_id)
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found."
        )
    return trip


@router.put("/{trip_id}")
def update_trip(trip_id: str, payload: UpdateTripPayload):
    """Update trip details."""
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    updated = db.update_trip(trip_id, updates)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found."
        )
    return updated


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: str):
    """Delete a trip by ID."""
    success = db.delete_trip(trip_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found."
        )
    return None


@router.post("/{trip_id}/save-itinerary")
def save_itinerary_to_trip(trip_id: str, payload: SaveItineraryPayload):
    """Save or update full generated itinerary for a trip."""
    trip = db.get_trip(trip_id)
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found."
        )
    updated_trip = db.save_full_itinerary(trip_id, payload.dict())
    return updated_trip

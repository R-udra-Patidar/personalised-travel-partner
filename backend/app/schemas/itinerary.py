"""Pydantic schemas for Itinerary (days + activities)."""
from pydantic import BaseModel, Field
from typing import List, Optional
from app.schemas.activity import ActivityResponse, ActivityUpdate


class ItineraryDayBase(BaseModel):
    day_number: int = Field(..., ge=1)
    date: Optional[str] = None
    theme: Optional[str] = None
    location_cluster: Optional[str] = None  # e.g. "Old Town + Museum District"


class ItineraryDayCreate(ItineraryDayBase):
    trip_id: str
    activities: List[ActivityResponse] = []


class ItineraryDayResponse(ItineraryDayBase):
    id: str
    trip_id: str
    activities: List[ActivityResponse] = []
    daily_budget_estimate: Optional[float] = None

    class Config:
        from_attributes = True


class BudgetEstimate(BaseModel):
    activities_total: float = 0.0
    food_total: float = 0.0
    accommodation_total: float = 0.0
    transportation_total: float = 0.0
    other_total: float = 0.0
    grand_total: float = 0.0
    daily_average: float = 0.0
    currency: str = "USD"
    disclaimer: str = "These are estimates only. Actual prices may vary."


class FullItineraryResponse(BaseModel):
    trip_id: str
    destination: str
    trip_summary: str
    days: List[ItineraryDayResponse]
    budget_estimate: Optional[BudgetEstimate] = None
    is_demo: bool = False  # True when generated from demo fallback


class GenerateItineraryRequest(BaseModel):
    trip_id: str
    preferences: dict  # The full TripPreferences dict


class RegenerateDayRequest(BaseModel):
    trip_id: str
    day_number: int
    reason: Optional[str] = None


class ReplaceActivityRequest(BaseModel):
    trip_id: str
    day_number: int
    activity_index: int
    reason: Optional[str] = None


class UpdateActivityRequest(BaseModel):
    trip_id: str
    day_number: int
    activity_index: int
    updates: ActivityUpdate

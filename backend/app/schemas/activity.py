"""Pydantic schemas for Activity data."""
from pydantic import BaseModel, Field
from typing import Optional


class ActivityBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    time_slot: Optional[str] = Field(None, description="e.g. '09:00 AM'")
    duration_minutes: Optional[int] = Field(None, ge=0, le=480)
    location: Optional[str] = None
    estimated_cost_usd: Optional[float] = Field(None, ge=0)
    transport_note: Optional[str] = None
    meal_suggestion: Optional[str] = None
    practical_notes: Optional[str] = None
    activity_type: Optional[str] = None  # sightseeing, food, transport, rest, etc.


class ActivityCreate(ActivityBase):
    day_id: str


class ActivityUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    time_slot: Optional[str] = None
    duration_minutes: Optional[int] = Field(None, ge=0, le=480)
    location: Optional[str] = None
    estimated_cost_usd: Optional[float] = Field(None, ge=0)
    transport_note: Optional[str] = None
    meal_suggestion: Optional[str] = None
    practical_notes: Optional[str] = None


class ActivityResponse(ActivityBase):
    id: str
    day_id: str
    sort_order: int = 0

    class Config:
        from_attributes = True

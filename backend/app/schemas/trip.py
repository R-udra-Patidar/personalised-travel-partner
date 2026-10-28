"""Pydantic schemas for Trip requests and responses."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from enum import Enum


class BudgetLevel(str, Enum):
    budget = "budget"
    moderate = "moderate"
    luxury = "luxury"


class TravelPace(str, Enum):
    slow = "slow"
    moderate = "moderate"
    fast = "fast"


class TravelerType(str, Enum):
    solo = "solo"
    couple = "couple"
    family = "family"
    friends = "friends"


class TravelVibe(str, Enum):
    beach = "beach"
    city = "city"
    adventure = "adventure"
    cultural = "cultural"
    nature = "nature"
    relaxation = "relaxation"
    road_trip = "road_trip"
    mixed = "mixed"


class TripPreferences(BaseModel):
    destination: Optional[str] = Field(None, description="Leave blank to get recommendations")
    travel_vibe: TravelVibe = Field(..., description="Type of travel experience desired")
    travel_days: int = Field(..., ge=1, le=30, description="Number of travel days")
    start_date: Optional[date] = None
    budget_level: BudgetLevel = Field(..., description="Budget level")
    num_travelers: int = Field(..., ge=1, le=20, description="Number of travelers")
    traveler_type: TravelerType = Field(..., description="Type of travel group")
    travel_pace: TravelPace = Field(..., description="Preferred pace")
    interests: List[str] = Field(
        default_factory=list,
        description="List of interests: food, sightseeing, nature, adventure, shopping, history, relaxation, nightlife"
    )
    additional_notes: Optional[str] = Field(None, max_length=500)


class TripCreate(BaseModel):
    name: Optional[str] = None
    preferences: TripPreferences


class TripUpdate(BaseModel):
    name: Optional[str] = None
    preferences: Optional[TripPreferences] = None
    status: Optional[str] = None


class TripResponse(BaseModel):
    id: str
    name: str
    destination: Optional[str]
    status: str  # draft | generated | saved
    preferences: dict
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class TripListResponse(BaseModel):
    trips: List[TripResponse]
    total: int

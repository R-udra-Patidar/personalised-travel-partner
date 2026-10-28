"""Pydantic schemas for destination recommendations."""
from pydantic import BaseModel, Field
from typing import List, Optional


class RecommendationRequest(BaseModel):
    travel_vibe: str
    budget_level: str
    travel_days: int
    traveler_type: str
    num_travelers: int
    interests: List[str] = []
    additional_notes: Optional[str] = None


class DestinationRecommendation(BaseModel):
    name: str
    country: str
    short_description: str
    why_it_matches: str
    suitable_activities: List[str]
    budget_category: str  # "budget-friendly" | "moderate" | "luxury"
    best_time_to_visit: str
    estimated_daily_cost_usd: Optional[str] = None  # e.g. "$50-$80/day"


class RecommendationResponse(BaseModel):
    recommendations: List[DestinationRecommendation]
    is_demo: bool = False
    disclaimer: str = (
        "Recommendations are AI-generated suggestions based on your preferences. "
        "Always verify travel details before booking."
    )

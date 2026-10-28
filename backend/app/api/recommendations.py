"""
Destination recommendation API endpoint.
"""
from fastapi import APIRouter
from typing import Dict, Any, List
from pydantic import BaseModel, Field

from app.services.ai_service import get_destination_recommendations

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


class RecommendationQuery(BaseModel):
    travel_vibe: str = Field(..., description="Vibe or style of travel, e.g., cultural, adventure, beach, relaxation")
    budget_level: str = Field(..., description="budget, moderate, luxury")
    travel_days: int = Field(5, ge=1, le=30)
    traveler_type: str = Field("solo", description="solo, couple, family, friends")
    interests: List[str] = Field(default_factory=list)


@router.post("")
def get_recommendations(query: RecommendationQuery) -> Dict[str, Any]:
    """
    Get top 3 destination recommendations matched to user preferences with explanations.
    """
    return get_destination_recommendations(query.dict())

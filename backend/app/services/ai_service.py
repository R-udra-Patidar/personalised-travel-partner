"""
AI Service — Google Gemini integration for itinerary generation.

Isolation principle: ALL Gemini API calls go through this module only.
Every function implements a demo fallback so the app works without an API key.
AI responses are validated before returning — never trusted blindly.
"""
import json
import logging
from typing import Optional
from app.core.config import settings
from app.services.demo_service import (
    get_demo_recommendations,
    get_demo_itinerary,
    get_demo_replacement_activity,
)

logger = logging.getLogger(__name__)

# ── Gemini Client Setup ──────────────────────────────────────────────────────

_gemini_client = None


def _get_gemini_client():
    """Lazily initialise Gemini client. Returns None if key is missing."""
    global _gemini_client
    if _gemini_client is not None:
        return _gemini_client
    if not settings.gemini_api_key:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)
        _gemini_client = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "max_output_tokens": 8192,
                "response_mime_type": "application/json",
            },
        )
        logger.info("Gemini client initialized successfully")
        return _gemini_client
    except Exception as exc:
        logger.warning("Failed to initialize Gemini client: %s", exc)
        return None


def _call_gemini(prompt: str) -> Optional[dict]:
    """
    Call Gemini and parse JSON response.
    Returns None on any failure (caller must use demo fallback).
    """
    client = _get_gemini_client()
    if client is None:
        return None
    try:
        response = client.generate_content(prompt)
        text = response.text.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("```", 2)[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.rsplit("```", 1)[0].strip()
        return json.loads(text)
    except json.JSONDecodeError as exc:
        logger.warning("Gemini returned invalid JSON: %s", exc)
        return None
    except Exception as exc:
        logger.warning("Gemini API call failed: %s", exc)
        return None


# ── Public Service Functions ─────────────────────────────────────────────────

def get_destination_recommendations(preferences: dict) -> dict:
    """
    Get top-3 destination recommendations based on user preferences.
    Falls back to demo data if AI is unavailable.
    """
    if not settings.ai_enabled:
        logger.info("AI disabled — returning demo recommendations")
        return {"recommendations": get_demo_recommendations(preferences), "is_demo": True}

    prompt = _build_recommendation_prompt(preferences)
    result = _call_gemini(prompt)

    if result and _validate_recommendations(result):
        result["is_demo"] = False
        return result

    logger.warning("Gemini recommendations invalid — falling back to demo")
    return {"recommendations": get_demo_recommendations(preferences), "is_demo": True}


def generate_itinerary(preferences: dict) -> dict:
    """
    Generate a full day-by-day itinerary.
    Falls back to demo data if AI is unavailable.
    """
    if not settings.ai_enabled:
        logger.info("AI disabled — returning demo itinerary")
        return {**get_demo_itinerary(preferences), "is_demo": True}

    prompt = _build_itinerary_prompt(preferences)
    result = _call_gemini(prompt)

    if result and _validate_itinerary(result):
        result["is_demo"] = False
        return result

    logger.warning("Gemini itinerary invalid — falling back to demo")
    return {**get_demo_itinerary(preferences), "is_demo": True}


def regenerate_day(preferences: dict, day_number: int, existing_days: list, reason: str = "") -> dict:
    """
    Regenerate a single day without affecting other days.
    """
    if not settings.ai_enabled:
        logger.info("AI disabled — returning demo day regeneration")
        demo = get_demo_itinerary(preferences)
        days = demo.get("days", [])
        day = next((d for d in days if d["day_number"] == day_number), days[0] if days else {})
        return {"day": day, "is_demo": True}

    prompt = _build_day_regeneration_prompt(preferences, day_number, existing_days, reason)
    result = _call_gemini(prompt)

    if result and "day" in result:
        result["is_demo"] = False
        return result

    # Fallback
    demo = get_demo_itinerary(preferences)
    days = demo.get("days", [])
    day = next((d for d in days if d["day_number"] == day_number), days[0] if days else {})
    return {"day": day, "is_demo": True}


def replace_activity(preferences: dict, day_context: dict, activity_index: int, reason: str = "") -> dict:
    """
    Generate a single replacement activity for a specific slot.
    """
    if not settings.ai_enabled:
        logger.info("AI disabled — returning demo replacement activity")
        return {"activity": get_demo_replacement_activity(preferences, day_context), "is_demo": True}

    prompt = _build_replacement_prompt(preferences, day_context, activity_index, reason)
    result = _call_gemini(prompt)

    if result and "activity" in result:
        result["is_demo"] = False
        return result

    return {"activity": get_demo_replacement_activity(preferences, day_context), "is_demo": True}


# ── Prompt Builders ──────────────────────────────────────────────────────────

def _build_recommendation_prompt(prefs: dict) -> str:
    return f"""You are a travel planning assistant. Recommend exactly 3 travel destinations.

User preferences:
- Travel vibe: {prefs.get('travel_vibe', 'mixed')}
- Budget level: {prefs.get('budget_level', 'moderate')}
- Travel days: {prefs.get('travel_days', 7)}
- Traveler type: {prefs.get('traveler_type', 'solo')}
- Number of travelers: {prefs.get('num_travelers', 1)}
- Interests: {', '.join(prefs.get('interests', []))}
- Notes: {prefs.get('additional_notes', 'None')}

Return ONLY valid JSON in exactly this structure:
{{
  "recommendations": [
    {{
      "name": "City/Region Name",
      "country": "Country Name",
      "short_description": "2-3 sentence description",
      "why_it_matches": "Explain why this matches the user's specific preferences",
      "suitable_activities": ["activity 1", "activity 2", "activity 3", "activity 4"],
      "budget_category": "budget-friendly|moderate|luxury",
      "best_time_to_visit": "Month range",
      "estimated_daily_cost_usd": "$X-$Y/day"
    }}
  ]
}}

Important:
- Give genuinely different destinations (different countries or very different regions)
- Be specific about why each matches the user's interests
- estimated_daily_cost_usd should align with their budget_level
- Do not fabricate specific hotel names or live prices"""


def _build_itinerary_prompt(prefs: dict) -> str:
    days = prefs.get('travel_days', 5)
    return f"""You are an expert travel planner. Create a detailed {days}-day itinerary.

Trip details:
- Destination: {prefs.get('destination', 'TBD')}
- Travel vibe: {prefs.get('travel_vibe', 'mixed')}
- Budget level: {prefs.get('budget_level', 'moderate')}
- Traveler type: {prefs.get('traveler_type', 'solo')}
- Number of travelers: {prefs.get('num_travelers', 1)}
- Travel pace: {prefs.get('travel_pace', 'moderate')}
- Interests: {', '.join(prefs.get('interests', []))}
- Start date: {prefs.get('start_date', 'flexible')}

Return ONLY valid JSON in exactly this structure:
{{
  "destination": "Full destination name",
  "trip_summary": "2-3 sentence summary of the trip",
  "days": [
    {{
      "day_number": 1,
      "date": "Day 1 (or actual date if provided)",
      "theme": "Short theme for the day e.g. Historic Old Town",
      "location_cluster": "Geographic area covered today",
      "activities": [
        {{
          "name": "Activity name",
          "description": "What to expect, 1-2 sentences",
          "time_slot": "09:00 AM",
          "duration_minutes": 90,
          "location": "Specific location/address area",
          "estimated_cost_usd": 15.0,
          "transport_note": "How to get there from previous activity",
          "meal_suggestion": "Nearby food recommendation (only for meal times)",
          "practical_notes": "Tips, booking requirements, best practices",
          "activity_type": "sightseeing|food|transport|rest|shopping|adventure"
        }}
      ],
      "daily_budget_estimate": 85.0
    }}
  ],
  "budget_estimate": {{
    "activities_total": 200.0,
    "food_total": 150.0,
    "accommodation_total": 300.0,
    "transportation_total": 100.0,
    "other_total": 50.0,
    "grand_total": 800.0,
    "daily_average": 160.0,
    "currency": "USD"
  }}
}}

Critical rules:
- Maximum 5 activities per day (including meals). Be realistic.
- Group nearby attractions together to minimize unnecessary travel
- Include lunch and dinner suggestions each day
- Schedule must be physically possible (travel time between locations)
- Cost estimates should match the {prefs.get('budget_level', 'moderate')} budget level
- Do NOT fabricate specific restaurant names as verified facts
- Label estimates clearly — do not claim they are live prices"""


def _build_day_regeneration_prompt(prefs: dict, day_number: int, existing_days: list, reason: str) -> str:
    other_days_summary = [
        f"Day {d['day_number']}: {d.get('theme', 'General exploration')} — visited {d.get('location_cluster', 'various areas')}"
        for d in existing_days if d.get('day_number') != day_number
    ]
    return f"""Regenerate ONLY Day {day_number} of a {prefs.get('travel_days', 5)}-day trip to {prefs.get('destination', 'the destination')}.

Trip context: {prefs.get('travel_vibe', 'mixed')} trip, {prefs.get('budget_level', 'moderate')} budget, {prefs.get('traveler_type', 'solo')} traveler
Interests: {', '.join(prefs.get('interests', []))}
Reason for regeneration: {reason or 'User requested change'}

Other days already planned (do not repeat these):
{chr(10).join(other_days_summary) if other_days_summary else 'No other days yet'}

Return ONLY valid JSON:
{{
  "day": {{
    "day_number": {day_number},
    "date": "Day {day_number}",
    "theme": "New theme for this day",
    "location_cluster": "Areas covered",
    "activities": [...],
    "daily_budget_estimate": 0.0
  }}
}}

Same rules: max 5 activities, group nearby attractions, include meals, realistic schedule."""


def _build_replacement_prompt(prefs: dict, day_context: dict, activity_index: int, reason: str) -> str:
    current_activities = day_context.get('activities', [])
    other_activities = [a['name'] for i, a in enumerate(current_activities) if i != activity_index]
    replaced = current_activities[activity_index] if activity_index < len(current_activities) else {}

    return f"""Replace ONE activity in a travel itinerary.

Trip: {prefs.get('destination')}, {prefs.get('budget_level', 'moderate')} budget, {prefs.get('traveler_type', 'solo')}
Day theme: {day_context.get('theme', 'General exploration')}
Activity to replace: {replaced.get('name', 'Unknown')} at {replaced.get('time_slot', 'TBD')}
Reason: {reason or 'User requested alternative'}
Other activities this day (do not duplicate): {', '.join(other_activities)}

Return ONLY valid JSON:
{{
  "activity": {{
    "name": "New activity name",
    "description": "Description",
    "time_slot": "{replaced.get('time_slot', '10:00 AM')}",
    "duration_minutes": {replaced.get('duration_minutes', 90)},
    "location": "Location",
    "estimated_cost_usd": {replaced.get('estimated_cost_usd', 10.0)},
    "transport_note": "How to get there",
    "meal_suggestion": null,
    "practical_notes": "Tips",
    "activity_type": "sightseeing"
  }}
}}"""


# ── Validators ───────────────────────────────────────────────────────────────

def _validate_recommendations(data: dict) -> bool:
    """Ensure recommendations have the required structure."""
    try:
        recs = data.get("recommendations", [])
        if not isinstance(recs, list) or len(recs) == 0:
            return False
        required = {"name", "country", "short_description", "why_it_matches", "suitable_activities"}
        return all(required.issubset(r.keys()) for r in recs)
    except Exception:
        return False


def _validate_itinerary(data: dict) -> bool:
    """Ensure itinerary has required structure."""
    try:
        if "days" not in data or not isinstance(data["days"], list):
            return False
        if len(data["days"]) == 0:
            return False
        for day in data["days"]:
            if "day_number" not in day or "activities" not in day:
                return False
            if not isinstance(day["activities"], list):
                return False
        return True
    except Exception:
        return False

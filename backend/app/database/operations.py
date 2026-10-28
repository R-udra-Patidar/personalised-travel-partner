"""
Database operations for Trips, Itineraries, Activities, and Budget Estimates.
Uses Supabase if available; seamlessly falls back to an in-memory store so the app is 100% testable out of the box.
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
import logging

from app.database.client import get_supabase_client

logger = logging.getLogger(__name__)

# In-memory storage fallback
_in_memory_trips: Dict[str, Dict[str, Any]] = {}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Trip Operations ──────────────────────────────────────────────────────────

def list_trips() -> List[Dict[str, Any]]:
    client = get_supabase_client()
    if client:
        try:
            res = client.table("trips").select("*").order("created_at", desc=True).execute()
            return res.data or []
        except Exception as e:
            logger.warning("Supabase list_trips error: %s. Falling back to in-memory store.", e)

    return sorted(list(_in_memory_trips.values()), key=lambda x: x.get("created_at", ""), reverse=True)


def get_trip(trip_id: str) -> Optional[Dict[str, Any]]:
    client = get_supabase_client()
    if client:
        try:
            res = client.table("trips").select("*, itinerary_days(*, activities(*)), budget_estimates(*)").eq("id", trip_id).execute()
            if res.data and len(res.data) > 0:
                data = res.data[0]
                # Format to match expected schema
                data["days"] = sorted(data.get("itinerary_days", []), key=lambda d: d.get("day_number", 0))
                for day in data["days"]:
                    day["activities"] = sorted(day.get("activities", []), key=lambda a: a.get("sort_order", 0))
                budget = data.get("budget_estimates")
                data["budget_estimate"] = budget[0] if isinstance(budget, list) and budget else budget
                return data
        except Exception as e:
            logger.warning("Supabase get_trip error: %s. Falling back to in-memory store.", e)

    return _in_memory_trips.get(trip_id)


def create_trip(trip_data: Dict[str, Any]) -> Dict[str, Any]:
    trip_id = str(uuid.uuid4())
    now = _now_iso()
    new_trip = {
        "id": trip_id,
        "title": trip_data.get("title") or f"Trip to {trip_data.get('destination', 'Paradise')}",
        "destination": trip_data.get("destination", "Unknown Destination"),
        "travel_vibe": trip_data.get("travel_vibe", "balanced"),
        "budget_level": trip_data.get("budget_level", "moderate"),
        "travel_days": trip_data.get("travel_days", 5),
        "traveler_type": trip_data.get("traveler_type", "solo"),
        "interests": trip_data.get("interests", []),
        "is_demo": trip_data.get("is_demo", False),
        "created_at": now,
        "updated_at": now,
        "days": [],
        "budget_estimate": None
    }

    client = get_supabase_client()
    if client:
        try:
            db_payload = {k: v for k, v in new_trip.items() if k not in ("days", "budget_estimate")}
            client.table("trips").insert(db_payload).execute()
        except Exception as e:
            logger.warning("Supabase create_trip error: %s. Storing in memory.", e)

    _in_memory_trips[trip_id] = new_trip
    return new_trip


def update_trip(trip_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    client = get_supabase_client()
    now = _now_iso()
    updates["updated_at"] = now

    if client:
        try:
            db_updates = {k: v for k, v in updates.items() if k not in ("days", "budget_estimate")}
            res = client.table("trips").update(db_updates).eq("id", trip_id).execute()
            if res.data:
                return get_trip(trip_id)
        except Exception as e:
            logger.warning("Supabase update_trip error: %s.", e)

    if trip_id in _in_memory_trips:
        _in_memory_trips[trip_id].update(updates)
        return _in_memory_trips[trip_id]
    return None


def delete_trip(trip_id: str) -> bool:
    client = get_supabase_client()
    if client:
        try:
            client.table("trips").delete().eq("id", trip_id).execute()
        except Exception as e:
            logger.warning("Supabase delete_trip error: %s.", e)

    if trip_id in _in_memory_trips:
        del _in_memory_trips[trip_id]
        return True
    return False


# ── Full Itinerary Persistence ───────────────────────────────────────────────

def save_full_itinerary(trip_id: str, itinerary_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Saves or replaces the days, activities, and budget estimate for a trip.
    """
    days = itinerary_data.get("days", [])
    budget = itinerary_data.get("budget_estimate")
    client = get_supabase_client()

    formatted_days = []
    for day_idx, day_info in enumerate(days):
        day_id = day_info.get("id") or str(uuid.uuid4())
        day_dict = {
            "id": day_id,
            "trip_id": trip_id,
            "day_number": day_info.get("day_number", day_idx + 1),
            "date": day_info.get("date", f"Day {day_idx + 1}"),
            "theme": day_info.get("theme", ""),
            "location_cluster": day_info.get("location_cluster", ""),
            "daily_budget_estimate": day_info.get("daily_budget_estimate", 0.0),
            "created_at": _now_iso(),
            "activities": []
        }

        acts = day_info.get("activities", [])
        for act_idx, act_info in enumerate(acts):
            act_id = act_info.get("id") or str(uuid.uuid4())
            act_dict = {
                "id": act_id,
                "day_id": day_id,
                "name": act_info.get("name", "Activity"),
                "description": act_info.get("description", ""),
                "time_slot": act_info.get("time_slot", ""),
                "duration_minutes": act_info.get("duration_minutes", 60),
                "location": act_info.get("location", ""),
                "estimated_cost_usd": act_info.get("estimated_cost_usd", 0.0),
                "transport_note": act_info.get("transport_note", ""),
                "meal_suggestion": act_info.get("meal_suggestion", None),
                "practical_notes": act_info.get("practical_notes", ""),
                "activity_type": act_info.get("activity_type", "sightseeing"),
                "booking_required": act_info.get("booking_required", False),
                "sort_order": act_info.get("sort_order", act_idx),
                "created_at": _now_iso()
            }
            day_dict["activities"].append(act_dict)
        formatted_days.append(day_dict)

    if client:
        try:
            # Delete old days (cascade will delete activities)
            client.table("itinerary_days").delete().eq("trip_id", trip_id).execute()
            for d in formatted_days:
                day_payload = {k: v for k, v in d.items() if k != "activities"}
                client.table("itinerary_days").insert(day_payload).execute()
                for a in d["activities"]:
                    client.table("activities").insert(a).execute()

            if budget:
                budget_payload = {
                    "id": str(uuid.uuid4()),
                    "trip_id": trip_id,
                    "currency": budget.get("currency", "USD"),
                    "total_estimate": budget.get("total_estimate", 0.0),
                    "accommodation_estimate": budget.get("accommodation_estimate", 0.0),
                    "food_estimate": budget.get("food_estimate", 0.0),
                    "activities_estimate": budget.get("activities_estimate", 0.0),
                    "transport_estimate": budget.get("transport_estimate", 0.0),
                    "notes": budget.get("notes", "")
                }
                client.table("budget_estimates").delete().eq("trip_id", trip_id).execute()
                client.table("budget_estimates").insert(budget_payload).execute()
        except Exception as e:
            logger.warning("Supabase save_full_itinerary error: %s", e)

    # In-memory save
    if trip_id in _in_memory_trips:
        _in_memory_trips[trip_id]["days"] = formatted_days
        _in_memory_trips[trip_id]["budget_estimate"] = budget
        _in_memory_trips[trip_id]["updated_at"] = _now_iso()
        return _in_memory_trips[trip_id]

    return get_trip(trip_id)


def update_single_activity(activity_id: str, updates: Dict[str, Any]) -> bool:
    client = get_supabase_client()
    if client:
        try:
            client.table("activities").update(updates).eq("id", activity_id).execute()
            return True
        except Exception as e:
            logger.warning("Supabase update_single_activity error: %s", e)

    # In-memory update
    for trip in _in_memory_trips.values():
        for day in trip.get("days", []):
            for act in day.get("activities", []):
                if act.get("id") == activity_id:
                    act.update(updates)
                    return True
    return False

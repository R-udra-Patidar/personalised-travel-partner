"""
Demo Service — High quality static fallback data for when Gemini AI is not configured or in offline mode.
Ensures the entire travel planner application works seamlessly out-of-the-box.
"""
from typing import Dict, Any, List


def get_demo_recommendations(preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
    vibe = str(preferences.get("travel_vibe", "balanced")).lower()
    budget = str(preferences.get("budget_level", "moderate")).lower()

    if "adventure" in vibe or "nature" in vibe:
        return [
            {
                "name": "Queenstown",
                "country": "New Zealand",
                "short_description": "The adventure capital of the world surrounded by the Southern Alps and Lake Wakatipu.",
                "why_it_matches": f"Matches your {vibe} vibe with alpine trekking, bungy jumping, and fjord exploration fitting a {budget} budget.",
                "suitable_activities": ["Routeburn Track hiking", "Milford Sound day cruise", "Skyline Gondola & Luge", "Dart River jet boating"],
                "best_time_to_visit": "December to March",
                "estimated_daily_cost_usd": 120.0 if budget == "budget" else (220.0 if budget == "moderate" else 450.0)
            },
            {
                "name": "Interlaken & Lauterbrunnen",
                "country": "Switzerland",
                "short_description": "Jaw-dropping valley with 72 waterfalls and dramatic alpine peaks.",
                "why_it_matches": "World-class hiking, paragliding, and scenic mountain railways.",
                "suitable_activities": ["Jungfraujoch excursion", "Lauterbrunnen valley walk", "Harder Kulm panoramic viewpoint", "Lake Brienz kayak tour"],
                "best_time_to_visit": "June to September",
                "estimated_daily_cost_usd": 150.0 if budget == "budget" else (280.0 if budget == "moderate" else 600.0)
            },
            {
                "name": "La Fortuna & Arenal",
                "country": "Costa Rica",
                "short_description": "Lush rainforests, active volcano vistas, and natural thermal hot springs.",
                "why_it_matches": "Unbeatable wildlife spotting, hanging bridges, and zip-lining adventures.",
                "suitable_activities": ["Arenal Volcano National Park hike", "Mistico Hanging Bridges", "Tabacon Natural Hot Springs", "La Fortuna waterfall swim"],
                "best_time_to_visit": "December to April",
                "estimated_daily_cost_usd": 70.0 if budget == "budget" else (160.0 if budget == "moderate" else 380.0)
            }
        ]
    elif "culture" in vibe or "history" in vibe:
        return [
            {
                "name": "Kyoto",
                "country": "Japan",
                "short_description": "Ancient imperial capital with thousands of classical Buddhist temples, shrines, and gardens.",
                "why_it_matches": f"Deeply immersive cultural history, tea ceremonies, and historic wooden architecture for a {budget} traveler.",
                "suitable_activities": ["Fushimi Inari morning walk", "Kinkaku-ji Golden Pavilion", "Gion historic district stroll", "Arashiyama Bamboo Grove"],
                "best_time_to_visit": "March to May & October to November",
                "estimated_daily_cost_usd": 80.0 if budget == "budget" else (170.0 if budget == "moderate" else 420.0)
            },
            {
                "name": "Rome",
                "country": "Italy",
                "short_description": "An open-air museum filled with nearly 3,000 years of globally influential art and architecture.",
                "why_it_matches": "Iconic monuments, ancient ruins, world-class cuisine, and historic cobblestone walks.",
                "suitable_activities": ["Colosseum & Roman Forum tour", "Vatican Museums & Sistine Chapel", "Trastevere food crawl", "Pantheon & Piazza Navona visit"],
                "best_time_to_visit": "April to May & September to October",
                "estimated_daily_cost_usd": 90.0 if budget == "budget" else (200.0 if budget == "moderate" else 480.0)
            },
            {
                "name": "Oaxaca City",
                "country": "Mexico",
                "short_description": "Culinary and indigenous cultural epicenter celebrated for vibrant markets, textiles, and colonial plazas.",
                "why_it_matches": "Rich culinary traditions, artisanal mezcal distilleries, and UNESCO archaeological ruins.",
                "suitable_activities": ["Monte Albán Zapotec ruins", "Mercado 20 de Noviembre food tasting", "Hierve el Agua petrified falls", "Santo Domingo Church & museum"],
                "best_time_to_visit": "October to March",
                "estimated_daily_cost_usd": 50.0 if budget == "budget" else (110.0 if budget == "moderate" else 260.0)
            }
        ]
    else:
        # Default / Balanced / Relaxing
        return [
            {
                "name": "Kyoto",
                "country": "Japan",
                "short_description": "Historic gardens, bamboo forests, serene shrines, and refined seasonal gastronomy.",
                "why_it_matches": f"Perfect harmonious blend of relaxation, scenic beauty, and authentic culture fitting your {budget} budget.",
                "suitable_activities": ["Fushimi Inari Shrine", "Philosopher's Path walk", "Traditional Matcha tasting", "Nishiki Market exploration"],
                "best_time_to_visit": "April or November",
                "estimated_daily_cost_usd": 85.0 if budget == "budget" else (180.0 if budget == "moderate" else 400.0)
            },
            {
                "name": "Ubud & Canggu, Bali",
                "country": "Indonesia",
                "short_description": "Tropical paradise featuring cascading rice terraces, yoga retreats, and sunset beaches.",
                "why_it_matches": "Balanced wellness, scenic café culture, and lush tropical landscapes.",
                "suitable_activities": ["Tegallalang Rice Terraces", "Campuhan Ridge Walk", "Uluwatu cliffside sunset", "Balinese cooking class"],
                "best_time_to_visit": "May to September",
                "estimated_daily_cost_usd": 40.0 if budget == "budget" else (95.0 if budget == "moderate" else 250.0)
            },
            {
                "name": "Barcelona",
                "country": "Spain",
                "short_description": "Coastal metropolis renowned for Gaudí architecture, beachside promenades, and vibrant tapas bars.",
                "why_it_matches": "Unbeatable synergy of beach relaxation, vibrant architecture, and late-evening dining.",
                "suitable_activities": ["Sagrada Família guided tour", "Park Güell panoramic stroll", "Gothic Quarter tapas tour", "Barceloneta sunset walk"],
                "best_time_to_visit": "May to June & September to October",
                "estimated_daily_cost_usd": 85.0 if budget == "budget" else (180.0 if budget == "moderate" else 390.0)
            }
        ]


def get_demo_itinerary(preferences: Dict[str, Any]) -> Dict[str, Any]:
    destination = preferences.get("destination") or "Kyoto, Japan"
    travel_days = int(preferences.get("travel_days", 3))
    budget_level = preferences.get("budget_level", "moderate")
    traveler_type = preferences.get("traveler_type", "solo")

    # Scale multiplier based on budget
    cost_mult = 0.6 if budget_level == "budget" else (1.0 if budget_level == "moderate" else 2.5)

    templates = [
        {
            "theme": "Historic Heart & Iconic Shrines",
            "location_cluster": "Central & Southern District",
            "activities": [
                {
                    "name": "Morning Shrine Exploration",
                    "description": "Walk through serene stone paths and vibrant historical gates before the peak crowds arrive.",
                    "time_slot": "08:30 AM - 10:30 AM",
                    "duration_minutes": 120,
                    "location": f"Historic Gateway, {destination}",
                    "estimated_cost_usd": round(0.0 * cost_mult, 2),
                    "transport_note": "Convenient 15-minute public transit or leisurely morning stroll from center.",
                    "meal_suggestion": None,
                    "practical_notes": "Wear comfortable walking shoes for light stone stairs.",
                    "activity_type": "sightseeing",
                    "booking_required": False
                },
                {
                    "name": "Artisanal Coffee & Heritage Bakery",
                    "description": "Refuel with local hand-pour coffee and warm freshly baked pastries at a neighborhood café.",
                    "time_slot": "10:45 AM - 11:45 AM",
                    "duration_minutes": 60,
                    "location": f"Heritage Quarter, {destination}",
                    "estimated_cost_usd": round(8.0 * cost_mult, 2),
                    "transport_note": "Short 5-minute walk from the morning shrine.",
                    "meal_suggestion": "Seasonal pastry with specialty drip brew.",
                    "practical_notes": "Cash or mobile card accepted.",
                    "activity_type": "food",
                    "booking_required": False
                },
                {
                    "name": "Old Town Cultural Museum & Garden",
                    "description": "Explore curated historical artifacts and tranquil zen gardens.",
                    "time_slot": "12:15 PM - 02:00 PM",
                    "duration_minutes": 105,
                    "location": f"Civic Garden District, {destination}",
                    "estimated_cost_usd": round(15.0 * cost_mult, 2),
                    "transport_note": "10-minute bus or tram ride.",
                    "meal_suggestion": "Traditional Bento or light lunch in the museum garden pavilion.",
                    "practical_notes": "English audio guides available on-site.",
                    "activity_type": "culture",
                    "booking_required": False
                },
                {
                    "name": "Sunset River Walk & Local Food Alley",
                    "description": "Stroll alongside the waterfront as lanterns flicker on, followed by dinner at a bustling local eatery.",
                    "time_slot": "05:30 PM - 08:00 PM",
                    "duration_minutes": 150,
                    "location": f"Waterfront Promenade, {destination}",
                    "estimated_cost_usd": round(28.0 * cost_mult, 2),
                    "transport_note": "Direct central walking boulevard.",
                    "meal_suggestion": "Regional specialties cooked fresh over charcoal.",
                    "practical_notes": "Early arrival around 6:00 PM avoids lines.",
                    "activity_type": "food",
                    "booking_required": False
                }
            ]
        },
        {
            "theme": "Nature, Panoramas & Scenic Views",
            "location_cluster": "Western Hills & Scenic Groves",
            "activities": [
                {
                    "name": "Bamboo Forest & Forest Bathing",
                    "description": "Experience morning sunlight filtering through towering green stalks in a quiet natural sanctuary.",
                    "time_slot": "08:00 AM - 10:00 AM",
                    "duration_minutes": 120,
                    "location": f"Scenic Hills, {destination}",
                    "estimated_cost_usd": round(5.0 * cost_mult, 2),
                    "transport_note": "Scenic railway or express bus from central station.",
                    "meal_suggestion": None,
                    "practical_notes": "Bring a refillable water bottle and insect repellent in summer.",
                    "activity_type": "nature",
                    "booking_required": False
                },
                {
                    "name": "Lakeside Traditional Tea Ceremony",
                    "description": "Learn the mindful art of traditional tea preparation overlooking serene waters.",
                    "time_slot": "10:30 AM - 12:00 PM",
                    "duration_minutes": 90,
                    "location": f"Tea Pavilion, {destination}",
                    "estimated_cost_usd": round(22.0 * cost_mult, 2),
                    "transport_note": "Easy 10-minute stroll across the scenic wooden bridge.",
                    "meal_suggestion": "Matcha served with delicate seasonal wagashi confections.",
                    "practical_notes": "Socks required when stepping onto tatami mat flooring.",
                    "activity_type": "culture",
                    "booking_required": True
                },
                {
                    "name": "Panoramic Viewpoint Cable Car",
                    "description": "Ascend the mountain peak for unobstructed panoramic views across the entire valley and cityscape.",
                    "time_slot": "02:00 PM - 04:30 PM",
                    "duration_minutes": 150,
                    "location": f"Mountain Vista Station, {destination}",
                    "estimated_cost_usd": round(18.0 * cost_mult, 2),
                    "transport_note": "Local connecting shuttle to base station.",
                    "meal_suggestion": "Locally churned artisan gelato or savory crepes at the summit.",
                    "practical_notes": "Bring a light windbreaker as the summit is breezy.",
                    "activity_type": "sightseeing",
                    "booking_required": False
                },
                {
                    "name": "Celebratory Rooftop Dinner",
                    "description": "Toast to the day's adventures with exquisite regional plates overlooking glittering evening lights.",
                    "time_slot": "07:00 PM - 09:30 PM",
                    "duration_minutes": 150,
                    "location": f"Skyline District, {destination}",
                    "estimated_cost_usd": round(45.0 * cost_mult, 2),
                    "transport_note": "Short taxi or metro back into downtown.",
                    "meal_suggestion": "Multi-course chef tasting menu or artisan wood-fired pizza.",
                    "practical_notes": "Reservation recommended 24 hours in advance.",
                    "activity_type": "food",
                    "booking_required": True
                }
            ]
        },
        {
            "theme": "Local Artisans, Markets & Modern Vibes",
            "location_cluster": "Design & Artisan Quarter",
            "activities": [
                {
                    "name": "Bustling Morning Market Crawl",
                    "description": "Immerse your senses in centuries-old food stalls selling skewers, pickled treats, and handmade knives.",
                    "time_slot": "09:30 AM - 11:30 AM",
                    "duration_minutes": 120,
                    "location": f"Central Covered Market, {destination}",
                    "estimated_cost_usd": round(18.0 * cost_mult, 2),
                    "transport_note": "5-minute subway walk.",
                    "meal_suggestion": "Fresh grilled skewers, seafood bites, and freshly squeezed juices.",
                    "practical_notes": "Best to carry small bills and eat designated near stalls.",
                    "activity_type": "food",
                    "booking_required": False
                },
                {
                    "name": "Contemporary Arts & Design Pavilion",
                    "description": "Tour groundbreaking modern installations, architecture, and local craft studios.",
                    "time_slot": "01:00 PM - 03:30 PM",
                    "duration_minutes": 150,
                    "location": f"Modern Arts Museum, {destination}",
                    "estimated_cost_usd": round(14.0 * cost_mult, 2),
                    "transport_note": "15-minute scenic bike ride along river canal.",
                    "meal_suggestion": "Contemporary bistro lunch with seasonal greens.",
                    "practical_notes": "Photography permitted in galleries without flash.",
                    "activity_type": "culture",
                    "booking_required": False
                },
                {
                    "name": "Sunset Speakeasy or Craft Brews",
                    "description": "Sample locally crafted beverages and small plates in a cozy, hidden alley venue.",
                    "time_slot": "06:30 PM - 08:30 PM",
                    "duration_minutes": 120,
                    "location": f"Historic Alleyways, {destination}",
                    "estimated_cost_usd": round(25.0 * cost_mult, 2),
                    "transport_note": "Short walk through lit pedestrian pathways.",
                    "meal_suggestion": "Artisan tapas and regional craft brew flight.",
                    "practical_notes": "Cozy atmosphere with limited seating.",
                    "activity_type": "entertainment",
                    "booking_required": False
                }
            ]
        }
    ]

    days = []
    total_activities_cost = 0.0

    # Build the required number of days
    for i in range(travel_days):
        tmpl = templates[i % len(templates)]
        day_num = i + 1
        day_cost = sum(a["estimated_cost_usd"] for a in tmpl["activities"])
        total_activities_cost += day_cost

        days.append({
            "day_number": day_num,
            "date": f"Day {day_num}",
            "theme": tmpl["theme"],
            "location_cluster": tmpl["location_cluster"],
            "daily_budget_estimate": round(day_cost, 2),
            "activities": tmpl["activities"]
        })

    # Calculate realistic budget estimates
    daily_stay = 60.0 if budget_level == "budget" else (150.0 if budget_level == "moderate" else 350.0)
    daily_food = 35.0 if budget_level == "budget" else (70.0 if budget_level == "moderate" else 160.0)
    daily_transit = 12.0 if budget_level == "budget" else (25.0 if budget_level == "moderate" else 60.0)

    acc_est = round(daily_stay * travel_days, 2)
    food_est = round(daily_food * travel_days, 2)
    trans_est = round(daily_transit * travel_days, 2)
    act_est = round(total_activities_cost, 2)
    total_est = round(acc_est + food_est + trans_est + act_est, 2)

    budget_estimate = {
        "currency": "USD",
        "total_estimate": total_est,
        "accommodation_estimate": acc_est,
        "food_estimate": food_est,
        "activities_estimate": act_est,
        "transport_estimate": trans_est,
        "notes": f"Itemized estimates based on {budget_level} standard for {traveler_type} travelers over {travel_days} days in {destination}."
    }

    return {
        "destination": destination,
        "travel_days": travel_days,
        "budget_level": budget_level,
        "traveler_type": traveler_type,
        "days": days,
        "budget_estimate": budget_estimate
    }


def get_demo_replacement_activity(preferences: Dict[str, Any], day_context: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "name": "Boutique Artisan Workshop & Tea Tasting",
        "description": "Engage directly with local craft masters, trying your hand at pottery or weaving, followed by warm heritage tea.",
        "time_slot": "02:00 PM - 03:30 PM",
        "duration_minutes": 90,
        "location": f"Artisans Alley, {preferences.get('destination', 'Downtown')}",
        "estimated_cost_usd": 20.0,
        "transport_note": "A scenic 10-minute walk from the previous activity.",
        "meal_suggestion": "Warm artisan pastry with herbal tea infusion.",
        "practical_notes": "All materials supplied; apron provided on arrival.",
        "activity_type": "culture",
        "booking_required": False
    }

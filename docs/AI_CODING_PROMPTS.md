# AI Coding Prompts Library
# Personalized Travel Itinerary Planner — Skill Wallet Capstone

> This document contains reusable AI prompts used throughout this project.
> Use these in Cursor AI agent, ChatGPT, or Google Gemini to generate and review code.

---

## How to Use This Library

1. Open Cursor IDE and press `Cmd+K` (inline edit) or `Cmd+L` (chat)
2. Copy the relevant prompt below
3. Paste it and adjust the `[PLACEHOLDERS]` to your specific context
4. Review the output before accepting it

---

## Prompt Category 1: Project Setup

### 1.1 — Generate FastAPI Backend Boilerplate

```
I am building a FastAPI backend for a travel itinerary planner.
Create a main.py that:
- Creates a FastAPI app with CORS middleware
- Reads CORS_ORIGINS from environment variables
- Includes routers from api/trips.py, api/recommendations.py, api/itinerary.py, api/export.py
- Has a /health endpoint returning {"status": "ok"}
- Sets up structured logging
- Handles startup and shutdown events
Technology: Python 3.11+, FastAPI, Pydantic v2, python-dotenv
```

### 1.2 — Generate React + Vite TypeScript Component

```
I am building a React TypeScript component for a travel itinerary planner.
Create a [COMPONENT_NAME] component that:
- [DESCRIBE WHAT IT DOES]
- Uses TypeScript interfaces for all props
- Has proper error and loading states
- Is accessible (aria labels, semantic HTML)
- Does not make API calls directly — receives data via props or calls a service function
```

---

## Prompt Category 2: Database Schema

### 2.1 — Generate Supabase SQL Migration

```
Generate a Supabase PostgreSQL migration for a travel itinerary planner.
Create tables for:
1. trips — stores trip metadata (destination, dates, preferences, budget_level, travelers, travel_style)
2. itinerary_days — stores day-level data linked to trips (day_number, date, theme)
3. activities — stores individual activities per day (name, description, time, duration, location, cost, notes)
4. budget_estimates — stores itemized cost estimates per trip

Requirements:
- Use UUID primary keys with gen_random_uuid()
- Add created_at and updated_at timestamps
- Use proper foreign key relationships with ON DELETE CASCADE
- Add appropriate indexes for common queries
- Include RLS (Row Level Security) policies
```

### 2.2 — Generate Supabase Client Operations

```
Generate a Python Supabase client wrapper for these operations:
- create_trip(trip_data: dict) -> dict
- get_trip(trip_id: str) -> dict
- list_trips(limit: int = 20, offset: int = 0) -> list
- update_trip(trip_id: str, updates: dict) -> dict
- delete_trip(trip_id: str) -> bool
- save_itinerary(trip_id: str, itinerary_data: dict) -> dict
- get_itinerary(trip_id: str) -> dict

Use: supabase-py, environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
Handle errors and return consistent response structures.
```

---

## Prompt Category 3: AI Integration

### 3.1 — Generate Gemini Prompt for Destination Recommendations

```
Write a Python function that calls Google Gemini API to recommend travel destinations.

Input: user preferences dict with keys:
- travel_vibe (str): e.g. "relaxing beach", "cultural city", "adventure"
- budget_level (str): "budget", "moderate", "luxury"
- travel_days (int): number of days
- traveler_type (str): e.g. "solo", "couple", "family"
- interests (list[str]): e.g. ["food", "history", "nature"]

Output: JSON array of 3 destination objects, each with:
- name (str)
- country (str)
- short_description (str)
- why_it_matches (str)
- suitable_activities (list[str])
- budget_category (str)
- best_time_to_visit (str)

Requirements:
- Use google-generativeai SDK
- Parse and validate JSON response
- Fall back to demo data if API key is missing or call fails
- Label demo data clearly
```

### 3.2 — Generate Gemini Prompt for Full Itinerary

```
Write a Python function that calls Google Gemini API to generate a full travel itinerary.

Input: trip preferences with destination, days, budget, interests, travel_style, vibe

Output: JSON object with:
- trip_summary (str)
- days: array of day objects, each containing:
  - day_number (int)
  - date (str, optional)
  - theme (str)
  - activities: array of activity objects with:
    - name, description, time_slot, duration_minutes, location,
      estimated_cost_usd, transport_note, meal_suggestion, practical_notes
  - daily_budget_estimate (float)

Requirements:
- Activities must be geographically clustered (nearby places grouped together)
- Schedule must be realistic (no more than 4-5 activities per day)
- Include lunch and dinner suggestions
- Validate the JSON structure before returning
- Demo fallback for missing API key
```

### 3.3 — Generate Prompt for Activity Replacement

```
Write a Python function that calls Google Gemini API to replace a single activity.

Input:
- trip context (destination, style, budget, interests)
- day context (day number, theme, other activities that day)
- activity to replace (name, time_slot)
- reason for replacement (optional string)

Output: single activity object with same structure as other activities

Requirements:
- Replacement must fit in the same time slot
- Must respect same budget level
- Must not duplicate other activities on the same day
- Validate response before returning
- Demo fallback
```

---

## Prompt Category 4: API Endpoints

### 4.1 — Generate FastAPI Router

```
Generate a FastAPI router for [RESOURCE] with these endpoints:
- POST /api/v1/[resource] — create
- GET /api/v1/[resource]/{id} — get by ID
- GET /api/v1/[resource] — list all
- PUT /api/v1/[resource]/{id} — update
- DELETE /api/v1/[resource]/{id} — delete

Requirements:
- Use Pydantic v2 models for request/response validation
- Use async def for all endpoints
- Return appropriate HTTP status codes
- Include proper error handling (HTTPException)
- Use a database service layer, not direct DB calls in routes
```

---

## Prompt Category 5: Frontend Components

### 5.1 — Generate Trip Preference Form

```
Generate a React TypeScript form component called TripPreferenceForm.
It should collect:
1. Destination (optional text input)
2. Travel vibe (select: beach, city, adventure, cultural, nature, relaxation)
3. Number of days (number input, 1-30)
4. Start date (optional date picker)
5. Budget level (radio: budget, moderate, luxury)
6. Number of travelers (number input)
7. Traveler type (select: solo, couple, family, friends)
8. Travel pace (radio: slow, moderate, fast)
9. Interests (multi-select checkboxes: food, sightseeing, nature, adventure, shopping, history, relaxation, nightlife)

Requirements:
- TypeScript interfaces for form data
- Zod or manual validation for required fields
- Show validation errors inline
- Submit button disabled until required fields are filled
- onSubmit callback prop that receives validated form data
- Clean modern styling with CSS modules or inline styles
```

### 5.2 — Generate Itinerary Day Card

```
Generate a React TypeScript component called ItineraryDayCard.
Props:
- day: DayItinerary object (day_number, date, theme, activities array)
- onRegenerateDay: (dayNumber: number) => void
- onReplaceActivity: (dayNumber: number, activityIndex: number) => void
- onEditActivity: (dayNumber: number, activityIndex: number, updates: Partial<Activity>) => void
- isLoading: boolean

Display:
- Day header with number, date, theme
- Each activity as a card with: time, name, description, location, cost, transport note
- Regenerate Day button
- Replace/Edit buttons per activity
- Loading skeleton when isLoading is true
```

---

## Prompt Category 6: Testing

### 6.1 — Generate pytest Tests for API Endpoint

```
Generate pytest tests for the [ENDPOINT] FastAPI endpoint.
Test cases:
1. Happy path — valid request returns 200 with expected structure
2. Missing required fields — returns 422 validation error
3. Invalid data types — returns 422
4. Resource not found — returns 404
5. Database error simulation — returns 500

Use: pytest, httpx (TestClient), unittest.mock to mock DB and AI calls
Do not make real API or database calls in tests.
```

### 6.2 — Generate Demo Mode Test

```
Write a test that verifies the demo mode fallback works correctly.
When DEMO_MODE=true or GEMINI_API_KEY is missing:
- The AI service should return valid demo data
- The demo data should have the same structure as live AI responses
- The response should be clearly labeled as demo content
- No real API call should be made
```

---

## Prompt Category 7: PDF Export

### 7.1 — Generate ReportLab PDF Generator

```
Generate a Python function using ReportLab that creates a PDF travel guide.
Input: full trip object with destination, dates, preferences, and day-by-day itinerary

PDF structure:
- Cover page: trip name, destination, dates, traveler info
- Page 2: Trip summary and preferences
- Pages 3+: One page per day with activities, times, locations, costs, transport notes
- Last page: Budget summary (itemized by category) + emergency contacts section

Requirements:
- Label emergency contacts as "general reference only — verify locally"
- Use consistent fonts and spacing
- Add page numbers
- Return PDF as bytes (for HTTP response streaming)
```

---

## How to Use Cursor AI Agent Mode

1. Open Cursor IDE
2. Press `Cmd+Shift+P` → type "Cursor: Toggle Agent Mode"
3. In the chat panel, paste any prompt from above
4. The agent will read your `.cursorrules` file automatically for project context
5. Review all generated code before accepting
6. Run tests after each AI-generated file

## Prompt Engineering Tips for This Project

- **Be specific about data shapes** — always describe input/output structures
- **Mention the exact libraries** — google-generativeai, supabase-py, reportlab, pydantic v2
- **Always request error handling** — ask for try/except and fallback logic
- **Ask for demo mode** — every AI-dependent feature needs a fallback
- **Request validation** — ask for Pydantic schemas on backend, TypeScript types on frontend

-- Migration: 001_initial_schema.sql
-- Description: Creates trips, itinerary_days, activities, and budget_estimates tables with RLS and cascade deletes

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Trips table
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    travel_vibe VARCHAR(100) NOT NULL DEFAULT 'balanced',
    budget_level VARCHAR(50) NOT NULL DEFAULT 'moderate',
    travel_days INT NOT NULL DEFAULT 5,
    traveler_type VARCHAR(50) NOT NULL DEFAULT 'solo',
    interests TEXT[] DEFAULT '{}',
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Itinerary Days table
CREATE TABLE IF NOT EXISTS itinerary_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    date VARCHAR(100),
    theme VARCHAR(255),
    location_cluster VARCHAR(255),
    daily_budget_estimate NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_trip_day UNIQUE (trip_id, day_number)
);

-- 3. Activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id UUID NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    time_slot VARCHAR(100),
    duration_minutes INT DEFAULT 60,
    location VARCHAR(255),
    estimated_cost_usd NUMERIC(10, 2) DEFAULT 0.00,
    transport_note TEXT,
    meal_suggestion TEXT,
    practical_notes TEXT,
    activity_type VARCHAR(100) DEFAULT 'sightseeing',
    booking_required BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Budget Estimates table
CREATE TABLE IF NOT EXISTS budget_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE UNIQUE,
    currency VARCHAR(10) DEFAULT 'USD',
    total_estimate NUMERIC(10, 2) DEFAULT 0.00,
    accommodation_estimate NUMERIC(10, 2) DEFAULT 0.00,
    food_estimate NUMERIC(10, 2) DEFAULT 0.00,
    activities_estimate NUMERIC(10, 2) DEFAULT 0.00,
    transport_estimate NUMERIC(10, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_itinerary_days_trip_id ON itinerary_days(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_day_id ON activities(day_id);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_estimates ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for development & capstone demo
CREATE POLICY "Allow public read trips" ON trips FOR SELECT USING (true);
CREATE POLICY "Allow public insert trips" ON trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update trips" ON trips FOR UPDATE USING (true);
CREATE POLICY "Allow public delete trips" ON trips FOR DELETE USING (true);

CREATE POLICY "Allow public read days" ON itinerary_days FOR SELECT USING (true);
CREATE POLICY "Allow public insert days" ON itinerary_days FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update days" ON itinerary_days FOR UPDATE USING (true);
CREATE POLICY "Allow public delete days" ON itinerary_days FOR DELETE USING (true);

CREATE POLICY "Allow public read activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Allow public insert activities" ON activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update activities" ON activities FOR UPDATE USING (true);
CREATE POLICY "Allow public delete activities" ON activities FOR DELETE USING (true);

CREATE POLICY "Allow public read budget" ON budget_estimates FOR SELECT USING (true);
CREATE POLICY "Allow public insert budget" ON budget_estimates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update budget" ON budget_estimates FOR UPDATE USING (true);
CREATE POLICY "Allow public delete budget" ON budget_estimates FOR DELETE USING (true);

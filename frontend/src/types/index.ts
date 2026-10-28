export type BudgetLevel = 'budget' | 'moderate' | 'luxury';
export type TravelerType = 'solo' | 'couple' | 'family' | 'friends';

export interface TripPreferences {
  destination?: string;
  travel_vibe: string;
  budget_level: BudgetLevel;
  travel_days: number;
  start_date?: string;
  num_travelers?: number;
  traveler_type: TravelerType;
  interests: string[];
}

export interface Activity {
  id?: string;
  day_id?: string;
  day_number?: number;
  name: string;
  description?: string;
  time_slot?: string;
  duration_minutes?: number;
  location?: string;
  estimated_cost_usd?: number;
  transport_note?: string;
  meal_suggestion?: string;
  practical_notes?: string;
  activity_type?: string;
  booking_required?: boolean;
}

export interface ItineraryDay {
  id?: string;
  trip_id?: string;
  day_number: number;
  date?: string;
  theme?: string;
  location_cluster?: string;
  daily_budget_estimate?: number;
  activities: Activity[];
}

export interface BudgetEstimate {
  id?: string;
  trip_id?: string;
  currency?: string;
  total_estimate?: number;
  accommodation_estimate?: number;
  food_estimate?: number;
  activities_estimate?: number;
  transport_estimate?: number;
  notes?: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  travel_vibe: string;
  budget_level: BudgetLevel;
  travel_days: number;
  start_date?: string;
  num_travelers?: number;
  traveler_type: TravelerType;
  interests: string[];
  created_at?: string;
  updated_at?: string;
  days?: ItineraryDay[];
  budget_estimate?: BudgetEstimate;
}

export interface Recommendation {
  name: string;
  country: string;
  short_description: string;
  why_it_matches: string;
  suitable_activities: string[];
  best_time_to_visit?: string;
  estimated_daily_cost_usd?: number;
}

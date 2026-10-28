import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TripPreferences, Recommendation } from '../types';
import TripPreferenceForm from '../components/forms/TripPreferenceForm';
import RecommendationCard from '../components/itinerary/RecommendationCard';
import { itineraryService } from '../services/itinerary';
import { tripsService } from '../services/trips';
import { Spinner, useToast } from '../components/ui';

type Step = 'preferences' | 'recommendations' | 'generating';

export default function PlanTripPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>('preferences');
  const [preferences, setPreferences] = useState<TripPreferences | null>(null);
  const [tripTitle, setTripTitle] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRecIndex, setSelectedRecIndex] = useState<number | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('Connecting to Gemini AI...');

  // Step 1: Form Submission
  const handlePreferencesSubmit = async (prefs: TripPreferences, title: string) => {
    setPreferences(prefs);
    setTripTitle(title);

    // If destination was entered, skip recommendation step and generate immediately
    if (prefs.destination && prefs.destination.trim().length > 0) {
      startGeneration(prefs, title);
    } else {
      // No destination specified -> Fetch AI recommendations (Phase 8)
      fetchRecommendations(prefs);
    }
  };

  // Step 2: Fetch Recommendations from AI
  const fetchRecommendations = async (prefs: TripPreferences) => {
    try {
      setLoadingRecs(true);
      setCurrentStep('recommendations');
      const response = await itineraryService.getRecommendations(prefs);
      setRecommendations(response.recommendations || []);
      if (response.recommendations?.length > 0) {
        setSelectedRecIndex(0); // Select first by default
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to get recommendations', 'error');
      setCurrentStep('preferences');
    } finally {
      setLoadingRecs(false);
    }
  };

  // Step 3: Start Itinerary Generation
  const startGeneration = async (prefs: TripPreferences, title: string) => {
    setCurrentStep('generating');

    try {
      // Progress animation simulation
      setGenerationProgress('Analyzing travel preferences & style...');
      await new Promise((r) => setTimeout(r, 600));

      setGenerationProgress('Generating day-by-day attractions with geographic clustering...');

      // First create trip entity in database
      const tripData = await tripsService.create({
        title: title || `${prefs.destination || 'Dream'} Itinerary`,
        destination: prefs.destination || 'Worldwide',
        travel_vibe: prefs.travel_vibe,
        budget_level: prefs.budget_level,
        travel_days: prefs.travel_days,
        traveler_type: prefs.traveler_type,
        interests: prefs.interests,
      });

      setGenerationProgress('Calculating itemized budget estimates and travel tips...');

      // Call itinerary generator with trip_id to automatically save
      const result = await itineraryService.generate({
        destination: prefs.destination,
        travel_vibe: prefs.travel_vibe,
        budget_level: prefs.budget_level,
        travel_days: prefs.travel_days,
        traveler_type: prefs.traveler_type,
        interests: prefs.interests,
        trip_id: tripData.id,
      });

      showToast(
        result.is_demo
          ? 'Itinerary generated in Demo Mode'
          : 'AI Itinerary generated successfully!',
        'success'
      );

      navigate(`/trips/${tripData.id}`);
    } catch (err: any) {
      showToast(err.message || 'Itinerary generation failed. Please try again.', 'error');
      setCurrentStep('preferences');
    }
  };

  // Continue from recommendations step with chosen destination
  const handleProceedWithRecommendation = () => {
    if (selectedRecIndex == null || !recommendations[selectedRecIndex]) {
      showToast('Please select a recommended destination first', 'info');
      return;
    }
    const chosen = recommendations[selectedRecIndex];
    if (!preferences) return;

    const updatedPrefs: TripPreferences = {
      ...preferences,
      destination: `${chosen.name}, ${chosen.country}`,
    };
    setPreferences(updatedPrefs);
    startGeneration(updatedPrefs, tripTitle || `${chosen.name} Adventure`);
  };

  return (
    <div className="container animate-fade" style={{ maxWidth: 900, paddingBottom: 'var(--space-12)' }}>
      {/* Stepper Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 'var(--font-size-sm)',
              background:
                currentStep === 'preferences'
                  ? 'var(--color-teal-500)'
                  : 'var(--color-teal-700)',
              color: '#fff',
            }}
          >
            1
          </div>
          <span
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              color: currentStep === 'preferences' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
            }}
          >
            Preferences
          </span>
        </div>

        <div style={{ width: 40, height: 2, background: 'var(--color-border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 'var(--font-size-sm)',
              background:
                currentStep === 'recommendations'
                  ? 'var(--color-teal-500)'
                  : 'rgba(255, 255, 255, 0.1)',
              color: currentStep === 'recommendations' ? '#fff' : 'var(--color-text-muted)',
            }}
          >
            2
          </div>
          <span
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              color:
                currentStep === 'recommendations' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
            }}
          >
            Recommendations
          </span>
        </div>

        <div style={{ width: 40, height: 2, background: 'var(--color-border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 'var(--font-size-sm)',
              background:
                currentStep === 'generating'
                  ? 'var(--color-gold-500)'
                  : 'rgba(255, 255, 255, 0.1)',
              color: currentStep === 'generating' ? '#000' : 'var(--color-text-muted)',
            }}
          >
            3
          </div>
          <span
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              color: currentStep === 'generating' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
            }}
          >
            Generation
          </span>
        </div>
      </div>

      {/* STEP 1: PREFERENCES FORM */}
      {currentStep === 'preferences' && (
        <div className="card animate-fade-up" style={{ padding: 'var(--space-8)' }}>
          <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>
              Plan Your Next <span className="text-gradient">Adventure</span>
            </h1>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 500, margin: '0 auto' }}>
              Fill in your travel preferences. If you don't know where to go, leave the destination empty and our AI will recommend top places for you!
            </p>
          </div>

          <TripPreferenceForm onSubmit={handlePreferencesSubmit} loading={loadingRecs} />
        </div>
      )}

      {/* STEP 2: DESTINATION RECOMMENDATIONS (Phase 8) */}
      {currentStep === 'recommendations' && (
        <div className="animate-fade">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(0, 245, 160, 0.1)',
                border: '1px solid rgba(0, 245, 160, 0.3)',
                color: 'var(--color-teal-300)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                marginBottom: 'var(--space-2)',
              }}
            >
              🎯 AI Recommendations Engine
            </div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>
              Destinations Tailored For You
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Based on your vibe ({preferences?.travel_vibe}), {preferences?.travel_days}-day duration, and {preferences?.budget_level} budget:
            </p>
          </div>

          {loadingRecs ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
              <Spinner size="lg" />
              <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
                Analyzing worldwide destinations matching your criteria...
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 'var(--space-4)',
                  marginBottom: 'var(--space-8)',
                }}
              >
                {recommendations.map((rec, idx) => (
                  <RecommendationCard
                    key={`${rec.name}-${idx}`}
                    rec={rec}
                    selected={selectedRecIndex === idx}
                    onSelect={() => setSelectedRecIndex(idx)}
                    index={idx}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--color-bg-card)',
                  padding: 'var(--space-4) var(--space-6)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setCurrentStep('preferences')}
                  className="btn btn-outline"
                >
                  ← Edit Preferences
                </button>

                <button
                  type="button"
                  onClick={handleProceedWithRecommendation}
                  className="btn btn-primary"
                  disabled={selectedRecIndex == null}
                >
                  Generate Full Itinerary for {selectedRecIndex != null ? recommendations[selectedRecIndex]?.name : 'Selected'} →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 3: GENERATING ITINERARY ANIMATION */}
      {currentStep === 'generating' && (
        <div
          className="card animate-fade"
          style={{
            textAlign: 'center',
            padding: 'var(--space-12) var(--space-6)',
            maxWidth: 580,
            margin: '0 auto',
          }}
        >
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <Spinner size="lg" />
          </div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)' }}>
            Creating Your Personalized Itinerary
          </h2>
          <p style={{ color: 'var(--color-teal-300)', fontWeight: 600, minHeight: 24, marginBottom: 'var(--space-4)' }}>
            {generationProgress}
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
            Our AI is carefully ordering activities, verifying geographic clusters to minimize transit time, and generating authentic meal and budget estimates.
          </p>
        </div>
      )}
    </div>
  );
}

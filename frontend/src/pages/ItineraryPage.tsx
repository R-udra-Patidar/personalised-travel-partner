import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTrip } from '../hooks/useTrips';
import { tripsService } from '../services/trips';
import { itineraryService } from '../services/itinerary';
import DayCard from '../components/itinerary/DayCard';
import BudgetSummary from '../components/itinerary/BudgetSummary';
import EditActivityModal from '../components/itinerary/EditActivityModal';
import { Spinner, Badge, useToast } from '../components/ui';
import { travelerEmoji, budgetLabel } from '../utils/formatters';
import type { Activity } from '../types';

export default function ItineraryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { trip, loading, error, setTrip } = useTrip(id);

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const [editingTarget, setEditingTarget] = useState<{
    dayNumber: number;
    activityIndex: number;
    activity: Activity;
  } | null>(null);

  // Handle PDF Export
  const handleDownloadPDF = async () => {
    if (!trip) return;
    try {
      setDownloadingPdf(true);
      showToast('Generating your customized PDF itinerary...', 'info');
      const filename = `${trip.destination.replace(/[^a-zA-Z0-9]/g, '_')}_Itinerary.pdf`;
      await itineraryService.downloadPDF(trip.id, filename);
      showToast('PDF downloaded successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to download PDF', 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Handle Day Regeneration (Phase 11)
  const handleRegenerateDay = async (dayNumber: number) => {
    if (!trip) return;
    try {
      setRegeneratingDay(dayNumber);
      showToast(`Regenerating Day ${dayNumber} with AI...`, 'info');

      const result = await itineraryService.regenerateDay(trip.id, dayNumber, {
        existing_days: trip.days || [],
        reason: 'User requested alternative schedule for this day',
        preferences: trip,
      });

      if (result.day && trip.days) {
        const updatedDays = trip.days.map((d) =>
          d.day_number === dayNumber ? { ...d, ...result.day } : d
        );
        const updatedTrip = { ...trip, days: updatedDays };
        setTrip(updatedTrip);
        showToast(`Day ${dayNumber} refreshed with new activities!`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to regenerate day', 'error');
    } finally {
      setRegeneratingDay(null);
    }
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (dayNumber: number, activityIndex: number, activity: Activity) => {
    setEditingTarget({ dayNumber, activityIndex, activity });
  };

  // Handle Save Manual Edits
  const handleSaveActivity = async (updatedActivity: Activity) => {
    if (!trip || !trip.days || !editingTarget) return;

    try {
      const updatedDays = trip.days.map((day) => {
        if (day.day_number !== editingTarget.dayNumber) return day;
        const newActivities = [...day.activities];
        newActivities[editingTarget.activityIndex] = updatedActivity;

        // Recalculate daily total estimate
        const dayTotal = newActivities.reduce(
          (sum, a) => sum + (a.estimated_cost_usd || 0),
          0
        );
        return { ...day, activities: newActivities, daily_budget_estimate: dayTotal };
      });

      // Recalculate activities total in budget estimate
      const totalActivitiesCost = updatedDays.reduce(
        (sum, d) => sum + (d.daily_budget_estimate || 0),
        0
      );

      const updatedBudget = trip.budget_estimate
        ? {
            ...trip.budget_estimate,
            activities_estimate: totalActivitiesCost,
            total_estimate:
              (trip.budget_estimate.accommodation_estimate || 0) +
              (trip.budget_estimate.food_estimate || 0) +
              (trip.budget_estimate.transport_estimate || 0) +
              totalActivitiesCost,
          }
        : undefined;

      // Persist to database
      await tripsService.saveItinerary(trip.id, {
        days: updatedDays,
        budget_estimate: updatedBudget,
      });

      setTrip({ ...trip, days: updatedDays, budget_estimate: updatedBudget });
      showToast('Activity updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update activity', 'error');
    }
  };

  // Handle AI Replace Single Activity
  const handleAiReplaceActivity = async (reason: string) => {
    if (!trip || !trip.days || !editingTarget) return;

    try {
      const targetDay = trip.days.find((d) => d.day_number === editingTarget.dayNumber);
      if (!targetDay) return;

      const result = await itineraryService.replaceActivity(trip.id, {
        day_context: targetDay,
        activity_index: editingTarget.activityIndex,
        reason,
        preferences: trip,
      });

      if (!result.activity) {
        throw new Error('No replacement activity generated');
      }

      const newActivity = result.activity;
      const updatedDays = trip.days.map((day) => {
        if (day.day_number !== editingTarget.dayNumber) return day;
        const newActivities = [...day.activities];
        newActivities[editingTarget.activityIndex] = newActivity;
        const dayTotal = newActivities.reduce(
          (sum, a) => sum + (a.estimated_cost_usd || 0),
          0
        );
        return { ...day, activities: newActivities, daily_budget_estimate: dayTotal };
      });

      // Recalculate activities total
      const totalActivitiesCost = updatedDays.reduce(
        (sum, d) => sum + (d.daily_budget_estimate || 0),
        0
      );

      const updatedBudget = trip.budget_estimate
        ? {
            ...trip.budget_estimate,
            activities_estimate: totalActivitiesCost,
            total_estimate:
              (trip.budget_estimate.accommodation_estimate || 0) +
              (trip.budget_estimate.food_estimate || 0) +
              (trip.budget_estimate.transport_estimate || 0) +
              totalActivitiesCost,
          }
        : undefined;

      await tripsService.saveItinerary(trip.id, {
        days: updatedDays,
        budget_estimate: updatedBudget,
      });

      setTrip({ ...trip, days: updatedDays, budget_estimate: updatedBudget });
      showToast('Activity replaced with AI alternative!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to replace activity', 'error');
    }
  };

  // Handle Trip Deletion
  const handleDeleteTrip = async () => {
    if (!trip) return;
    if (!confirm(`Are you sure you want to delete "${trip.title}"?`)) return;

    try {
      await tripsService.delete(trip.id);
      showToast('Trip deleted', 'info');
      navigate('/');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete trip', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
        <Spinner size="lg" />
        <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
          Loading your travel itinerary...
        </p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🗺️</div>
        <h2>Trip Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
          {error || "The itinerary you're looking for doesn't exist or was removed."}
        </p>
        <Link to="/" className="btn btn-primary">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const days = trip.days || [];
  const budget = trip.budget_estimate;

  return (
    <div className="container animate-fade" style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Top Navigation & Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <Link to="/" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
          ← Back to Dashboard
        </Link>

        {/* Top Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={handleDownloadPDF}
            className="btn btn-primary btn-sm"
            disabled={downloadingPdf}
          >
            {downloadingPdf ? <Spinner size="sm" /> : '📥 Export PDF'}
          </button>
          <button
            onClick={handleDeleteTrip}
            className="btn btn-danger btn-sm"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Hero Itinerary Header */}
      <div
        className="card"
        style={{
          background:
            'radial-gradient(ellipse at top left, rgba(0, 245, 160, 0.08), transparent 60%), var(--color-bg-card)',
          padding: 'var(--space-6) var(--space-8)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
              <Badge variant="teal">📍 {trip.destination}</Badge>
              <Badge variant="gold">🎭 {trip.travel_vibe}</Badge>
              <Badge variant="blue">{travelerEmoji(trip.traveler_type)} {trip.traveler_type}</Badge>
              <Badge variant="purple">{budgetLabel(trip.budget_level)}</Badge>
              <Badge variant="green">⏱️ {trip.travel_days} Days</Badge>
            </div>

            <h1 style={{ fontSize: 'var(--font-size-2xl)', marginTop: 'var(--space-2)' }}>
              {trip.title}
            </h1>
          </div>
        </div>

        {/* Interests Pills */}
        {trip.interests && trip.interests.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-2)',
              flexWrap: 'wrap',
              marginTop: 'var(--space-4)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
              Focus Areas:
            </span>
            {trip.interests.map((interest, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: 'var(--font-size-xs)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--color-text-main)',
                }}
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Days Schedule (Left) + Budget & Insights (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-8)',
          alignItems: 'start',
        }}
      >
        {/* Left: Day-by-Day Schedule */}
        <div style={{ flex: '2', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
              Day-by-Day Schedule
            </h2>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              {days.length} days curated
            </span>
          </div>

          {days.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>No activities generated for this trip yet.</p>
            </div>
          ) : (
            days.map((day) => (
              <div key={day.id || day.day_number} style={{ position: 'relative' }}>
                <DayCard
                  day={day}
                  tripId={trip.id}
                  onRegenerateDay={handleRegenerateDay}
                  onEditActivity={handleOpenEdit}
                  onReplaceActivity={(dayNumber, idx) => {
                    if (day.activities && day.activities[idx]) {
                      handleOpenEdit(dayNumber, idx, day.activities[idx]);
                    }
                  }}
                />
                {regeneratingDay === day.day_number && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(10, 15, 29, 0.75)',
                      backdropFilter: 'blur(4px)',
                      borderRadius: 'var(--radius-xl)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'var(--space-3)',
                      zIndex: 10,
                    }}
                  >
                    <Spinner size="sm" />
                    <span style={{ fontWeight: 600 }}>Refreshing Day {day.day_number}...</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Right: Budget Estimate & Travel Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Itemized Budget Card */}
          {budget && <BudgetSummary budget={budget} />}

          {/* Practical Advice & Emergency Card */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span>💡</span> Smart Travel Tips
            </h3>
            <ul style={{ paddingLeft: 'var(--space-4)', margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
              <li>
                <strong style={{ color: 'var(--color-text-main)' }}>Custom Adjustments:</strong> Click ✏️ on any activity to tweak duration, timing, or budget; click 🔄 to get an AI replacement.
              </li>
              <li>
                <strong style={{ color: 'var(--color-text-main)' }}>Local Currency:</strong> Always carry some small cash bills for public transit and street markets.
              </li>
              <li>
                <strong style={{ color: 'var(--color-text-main)' }}>Transit Timing:</strong> Attractions in each day are clustered together to minimize commute times.
              </li>
              <li>
                <strong style={{ color: 'var(--color-text-main)' }}>Emergency Contacts:</strong> Emergency guidelines and numbers are generated and included in the downloadable PDF.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Edit / Replace Activity Modal */}
      {editingTarget && (
        <EditActivityModal
          activity={editingTarget.activity}
          dayNumber={editingTarget.dayNumber}
          activityIndex={editingTarget.activityIndex}
          onSave={handleSaveActivity}
          onAiReplace={handleAiReplaceActivity}
          onClose={() => setEditingTarget(null)}
        />
      )}
    </div>
  );
}

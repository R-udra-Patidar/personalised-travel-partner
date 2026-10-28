import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Trip } from '../../types';
import { budgetLabel, travelerEmoji, timeSince, formatCurrency } from '../../utils/formatters';

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
}

export default function TripCard({ trip, onDelete }: TripCardProps) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${trip.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(trip.id);
  };

  const hasDays = trip.days && trip.days.length > 0;
  const total = trip.budget_estimate?.total_estimate;

  return (
    <div
      className="trip-card animate-fade-up"
      onClick={() => navigate(`/trips/${trip.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/trips/${trip.id}`)}
    >
      {/* Header */}
      <div className="trip-card-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="trip-card-title truncate">{trip.title}</div>
          <div className="trip-card-destination">
            📍 {trip.destination}
          </div>
        </div>
        <span style={{ fontSize: '2rem' }}>{travelerEmoji(trip.traveler_type)}</span>
      </div>

      {/* Meta chips */}
      <div className="trip-card-meta">
        <div className="trip-meta-item">
          <span>📅</span>
          <span>{trip.travel_days} days</span>
        </div>
        <div className="trip-meta-item">
          <span>💰</span>
          <span>{budgetLabel(trip.budget_level)}</span>
        </div>
        <div className="trip-meta-item">
          <span>🎯</span>
          <span>{trip.travel_vibe}</span>
        </div>
        {hasDays && (
          <div className="trip-meta-item" style={{ color: 'var(--color-teal-400)' }}>
            <span>✅</span>
            <span>{trip.days!.length} days planned</span>
          </div>
        )}
      </div>

      {/* Budget */}
      {total != null && (
        <div style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-gold-300)',
          fontWeight: 700,
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)'
        }}>
          <span>💎</span>
          <span>Est. {formatCurrency(total)}</span>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {timeSince(trip.created_at)}
        </span>
        <div className="trip-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(`/trips/${trip.id}`)}
          >
            View
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '...' : '🗑️'}
          </button>
        </div>
      </div>
    </div>
  );
}

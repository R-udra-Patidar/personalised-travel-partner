import { useState } from 'react';
import type { ItineraryDay, Activity } from '../../types';
import { formatCurrency, activityTypeColor } from '../../utils/formatters';

interface DayCardProps {
  day: ItineraryDay;
  tripId?: string;
  onRegenerateDay?: (dayNumber: number) => void;
  onReplaceActivity?: (dayNumber: number, activityIndex: number) => void;
  onEditActivity?: (dayNumber: number, activityIndex: number, activity: Activity) => void;
}

export default function DayCard({
  day,
  onRegenerateDay,
  onReplaceActivity,
  onEditActivity,
}: DayCardProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="day-card animate-fade-up">
      {/* Header */}
      <div className="day-card-header" onClick={() => setOpen((o) => !o)}>
        <div className="day-number-badge">{day.day_number}</div>
        <div className="day-card-info">
          <div className="day-theme">{day.theme || `Day ${day.day_number}`}</div>
          {day.location_cluster && (
            <div className="day-cluster">📍 {day.location_cluster}</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginLeft: 'auto' }}>
          {day.daily_budget_estimate != null && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gold-300)', fontWeight: 700 }}>
              {formatCurrency(day.daily_budget_estimate)}
            </div>
          )}
          {onRegenerateDay && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={(e) => { e.stopPropagation(); onRegenerateDay(day.day_number); }}
              data-tooltip="Regenerate this day"
            >
              🔄
            </button>
          )}
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            {open ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="day-card-body">
          {day.activities.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: '12px 0' }}>
              No activities for this day yet.
            </p>
          ) : (
            day.activities.map((act, idx) => (
              <div key={act.id || idx} className="activity-item">
                {/* Time */}
                <div className="activity-time">
                  <div>{act.time_slot || '—'}</div>
                  {act.duration_minutes && (
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {act.duration_minutes}m
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="activity-content">
                  <div className="activity-name">{act.name}</div>
                  {act.description && <p className="activity-desc">{act.description}</p>}
                  <div className="activity-meta">
                    {act.location && (
                      <span className="activity-detail">
                        <span>📍</span>
                        <span>{act.location}</span>
                      </span>
                    )}
                    {act.transport_note && (
                      <span className="activity-detail">
                        <span>🚌</span>
                        <span>{act.transport_note}</span>
                      </span>
                    )}
                    {act.booking_required && (
                      <span className="activity-detail" style={{ color: 'var(--color-warning)' }}>
                        <span>📋</span>
                        <span>Booking required</span>
                      </span>
                    )}
                    {act.meal_suggestion && (
                      <span className="activity-detail" style={{ color: 'var(--color-gold-300)' }}>
                        <span>🍽️</span>
                        <span>{act.meal_suggestion}</span>
                      </span>
                    )}
                    {act.activity_type && (
                      <span className={`badge ${activityTypeColor(act.activity_type)}`}>
                        {act.activity_type}
                      </span>
                    )}
                  </div>
                  {act.practical_notes && (
                    <div style={{
                      marginTop: 'var(--space-2)',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-teal-400)',
                      display: 'flex',
                      gap: 'var(--space-1)'
                    }}>
                      <span>💡</span>
                      <span>{act.practical_notes}</span>
                    </div>
                  )}
                </div>

                {/* Cost */}
                {act.estimated_cost_usd != null && (
                  <div className="activity-cost">
                    {formatCurrency(act.estimated_cost_usd)}
                  </div>
                )}

                {/* Actions */}
                <div className="activity-actions" style={{ display: 'flex', gap: '4px' }}>
                  {onEditActivity && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onEditActivity(day.day_number, idx, act)}
                      title="Edit activity details"
                      style={{ fontSize: '13px', padding: '4px 6px' }}
                    >
                      ✏️
                    </button>
                  )}
                  {onReplaceActivity && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onReplaceActivity(day.day_number, idx)}
                      title="Replace with AI alternative"
                      style={{ fontSize: '13px', padding: '4px 6px' }}
                    >
                      🔄
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

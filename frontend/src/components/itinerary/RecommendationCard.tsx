import type { Recommendation } from '../../types';
import { formatCurrency, destinationFlag } from '../../utils/formatters';

interface RecommendationCardProps {
  rec: Recommendation;
  selected: boolean;
  onSelect: () => void;
  index: number;
}

export default function RecommendationCard({ rec, selected, onSelect, index }: RecommendationCardProps) {
  const flag = destinationFlag(rec.country);

  return (
    <div
      className={`rec-card animate-fade-up animate-delay-${index + 1}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      style={{ position: 'relative' }}
    >
      {selected && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'var(--gradient-teal)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          zIndex: 2,
        }}>
          ✓
        </div>
      )}

      {/* Flag + Name */}
      <div>
        <div className="rec-card-flag">{flag}</div>
        <div className="rec-card-name" style={{ marginTop: 8 }}>{rec.name}</div>
        <div className="rec-card-country">📍 {rec.country}</div>
      </div>

      {/* Description */}
      <p className="rec-card-desc">{rec.short_description}</p>

      {/* Why it matches */}
      <div className="rec-card-why">
        "{rec.why_it_matches}"
      </div>

      {/* Activity tags */}
      {rec.suitable_activities && (
        <div className="rec-activities">
          {rec.suitable_activities.slice(0, 4).map((act, i) => (
            <span key={i} className="rec-activity-tag">
              {act}
            </span>
          ))}
        </div>
      )}

      {/* Footer info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        {rec.estimated_daily_cost_usd != null && (
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            ~{formatCurrency(rec.estimated_daily_cost_usd)}/day
          </div>
        )}
        {rec.best_time_to_visit && (
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            🌤 {rec.best_time_to_visit}
          </div>
        )}
      </div>

      {/* Select button */}
      <button
        className={`btn ${selected ? 'btn-primary' : 'btn-secondary'} w-full`}
        style={{ marginTop: 4 }}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
      >
        {selected ? '✓ Selected — Continue →' : 'Choose This Destination'}
      </button>
    </div>
  );
}

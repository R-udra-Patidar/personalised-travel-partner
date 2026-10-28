import { useState } from 'react';
import type { TripPreferences } from '../../types';

const VIBES = [
  { value: 'cultural',    label: '🏛️ Cultural',   desc: 'Museums, history & heritage' },
  { value: 'adventure',   label: '🏔️ Adventure',  desc: 'Trekking, sports & thrills' },
  { value: 'beach',       label: '🏖️ Beach',      desc: 'Sun, sand & ocean' },
  { value: 'nature',      label: '🌿 Nature',     desc: 'Wildlife & scenic landscapes' },
  { value: 'city',        label: '🌆 City',       desc: 'Urban, art & nightlife' },
  { value: 'relaxation',  label: '🧘 Relaxation', desc: 'Spas, yoga & slow travel' },
  { value: 'road_trip',   label: '🚗 Road Trip',  desc: 'Drive across scenic routes' },
  { value: 'mixed',       label: '🎭 Mixed',      desc: 'A bit of everything' },
];

const BUDGETS = [
  { value: 'budget',   label: '💸 Budget',   desc: 'Hostels, street food, free sights' },
  { value: 'moderate', label: '💰 Moderate', desc: 'Mid-range hotels, restaurants' },
  { value: 'luxury',   label: '💎 Luxury',   desc: 'Premium resorts, fine dining' },
];

const TRAVELER_TYPES = [
  { value: 'solo',    label: '🧳 Solo',     },
  { value: 'couple',  label: '💑 Couple',   },
  { value: 'family',  label: '👨‍👩‍👧‍👦 Family',  },
  { value: 'friends', label: '👥 Friends',  },
];

const INTERESTS = [
  '🍜 Food & Cuisine', '🏛️ History & Culture', '🌿 Nature & Parks',
  '🎨 Art & Design', '🎵 Music & Nightlife', '🛍️ Shopping',
  '🏄 Adventure Sports', '📸 Photography', '🧘 Wellness & Spa',
  '⛪ Architecture', '🐘 Wildlife', '🎭 Theater & Performances'
];

interface TripPreferenceFormProps {
  onSubmit: (prefs: TripPreferences, title: string) => void;
  loading?: boolean;
}

export default function TripPreferenceForm({ onSubmit, loading = false }: TripPreferenceFormProps) {
  const [form, setForm] = useState<TripPreferences>({
    destination: '',
    travel_vibe: 'mixed',
    budget_level: 'moderate',
    travel_days: 5,
    start_date: '',
    num_travelers: 1,
    traveler_type: 'solo',
    interests: [],
  });
  const [title, setTitle] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.travel_days < 1 || form.travel_days > 30) e.travel_days = 'Duration must be between 1 and 30 days';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInterestToggle = (interest: string) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form, title || `Trip to ${form.destination || 'My Next Adventure'}`);
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

        {/* Section: Trip Identity */}
        <section>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-5)', color: 'var(--color-teal-300)' }}>
            📝 Trip Identity
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Trip Title (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder='e.g., "Tokyo Cherry Blossom Adventure"'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">
                Destination <span style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 400 }}>(Leave blank to get AI recommendations)</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder='e.g., "Tokyo, Japan" or "Italian Coast"'
                value={form.destination || ''}
                onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
              />
            </div>
          </div>
        </section>

        {/* Section: Travel Vibe */}
        <section>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-5)', color: 'var(--color-teal-300)' }}>
            🎭 Travel Vibe
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 'var(--space-3)' }}>
            {VIBES.map((vibe) => (
              <button
                key={vibe.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, travel_vibe: vibe.value as any }))}
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${form.travel_vibe === vibe.value ? 'var(--color-teal-500)' : 'var(--color-border)'}`,
                  background: form.travel_vibe === vibe.value ? 'rgba(13, 148, 136, 0.15)' : 'var(--color-bg-input)',
                  color: form.travel_vibe === vibe.value ? 'var(--color-teal-300)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'var(--transition-fast)',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{vibe.label}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.7 }}>{vibe.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Section: Trip Details */}
        <section>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-5)', color: 'var(--color-teal-300)' }}>
            📅 Trip Dates & Travelers
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Duration (Days) <span className="req">*</span></label>
              <input
                type="number"
                className="form-input"
                min={1}
                max={30}
                value={form.travel_days}
                onChange={(e) => setForm((f) => ({ ...f, travel_days: parseInt(e.target.value) || 1 }))}
              />
              {errors.travel_days && <span className="form-error">{errors.travel_days}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Start Date (optional)</label>
              <input
                type="date"
                className="form-input"
                value={form.start_date || ''}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Number of Travelers</label>
              <input
                type="number"
                className="form-input"
                min={1}
                max={50}
                value={form.num_travelers || 1}
                onChange={(e) => setForm((f) => ({ ...f, num_travelers: parseInt(e.target.value) || 1 }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Traveler Party Type <span className="req">*</span></label>
              <select
                className="form-select"
                value={form.traveler_type}
                onChange={(e) => setForm((f) => ({ ...f, traveler_type: e.target.value as any }))}
              >
                {TRAVELER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Section: Budget */}
        <section>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-5)', color: 'var(--color-teal-300)' }}>
            💰 Budget Level
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
            {BUDGETS.map((b) => (
              <button
                key={b.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, budget_level: b.value as any }))}
                style={{
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${form.budget_level === b.value ? 'var(--color-gold-400)' : 'var(--color-border)'}`,
                  background: form.budget_level === b.value ? 'rgba(234, 179, 8, 0.12)' : 'var(--color-bg-input)',
                  color: form.budget_level === b.value ? 'var(--color-gold-300)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'var(--transition-fast)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', marginBottom: 4 }}>{b.label}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>{b.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Section: Interests */}
        <section>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--color-teal-300)' }}>
            🎯 Interests <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 400 }}>(select all that apply)</span>
          </h3>
          <div className="chip-group">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                type="button"
                className={`chip ${form.interests.includes(interest) ? 'selected' : ''}`}
                onClick={() => handleInterestToggle(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </section>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ minWidth: 260 }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                <span>
                  {form.destination ? 'Generating Itinerary...' : 'Finding Destinations...'}
                </span>
              </>
            ) : (
              <>
                <span>{form.destination ? '✨ Generate My Itinerary' : '🌍 Get Recommendations'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

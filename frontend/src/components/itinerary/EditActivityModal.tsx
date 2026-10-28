import { useState } from 'react';
import type { Activity } from '../../types';
import { Spinner } from '../ui';

interface EditActivityModalProps {
  activity: Activity;
  dayNumber: number;
  activityIndex: number;
  onSave: (updatedActivity: Activity) => Promise<void>;
  onAiReplace: (reason: string) => Promise<void>;
  onClose: () => void;
}

export default function EditActivityModal({
  activity,
  dayNumber,
  activityIndex,
  onSave,
  onAiReplace,
  onClose,
}: EditActivityModalProps) {
  const [form, setForm] = useState<Activity>({ ...activity });
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'ai'>('edit');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleAiReplace = async () => {
    setReplacing(true);
    try {
      await onAiReplace(reason || 'Find a distinct, fun alternative for this time slot');
      onClose();
    } finally {
      setReplacing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 24, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card animate-fade-up"
        style={{
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 'var(--space-6)',
          border: '1px solid rgba(0, 245, 160, 0.25)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-teal-300)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Day {dayNumber} • Slot #{activityIndex + 1}
            </div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', marginTop: '2px' }}>
              Manage Activity
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '18px', padding: '4px 8px' }}
          >
            ✕
          </button>
        </div>

        {/* Tab switch: Manual Edit vs AI Replace */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '4px',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-5)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`btn btn-sm ${activeTab === 'edit' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1 }}
          >
            ✏️ Manual Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`btn btn-sm ${activeTab === 'ai' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1 }}
          >
            🤖 AI Substitute
          </button>
        </div>

        {/* TAB 1: MANUAL EDIT */}
        {activeTab === 'edit' && (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label className="form-label">Activity Name *</label>
              <input
                type="text"
                required
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div>
                <label className="form-label">Time Slot</label>
                <input
                  type="text"
                  placeholder="e.g. 09:30 AM - 12:00 PM"
                  className="form-control"
                  value={form.time_slot || ''}
                  onChange={(e) => setForm({ ...form, time_slot: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Est. Cost (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="form-control"
                  value={form.estimated_cost_usd ?? 0}
                  onChange={(e) =>
                    setForm({ ...form, estimated_cost_usd: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div>
              <label className="form-label">Location</label>
              <input
                type="text"
                placeholder="Attraction address or landmark"
                className="form-control"
                value={form.location || ''}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                rows={2}
                className="form-control"
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Practical Notes & Tips</label>
              <input
                type="text"
                placeholder="e.g. Pre-book online; bring sunscreen"
                className="form-control"
                value={form.practical_notes || ''}
                onChange={(e) => setForm({ ...form, practical_notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div>
                <label className="form-label">Transit Note</label>
                <input
                  type="text"
                  placeholder="e.g. 10 min metro ride"
                  className="form-control"
                  value={form.transport_note || ''}
                  onChange={(e) => setForm({ ...form, transport_note: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Meal Recommendation</label>
                <input
                  type="text"
                  placeholder="e.g. Local noodle shop nearby"
                  className="form-control"
                  value={form.meal_suggestion || ''}
                  onChange={(e) => setForm({ ...form, meal_suggestion: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
              <input
                type="checkbox"
                id="booking_required"
                checked={form.booking_required || false}
                onChange={(e) => setForm({ ...form, booking_required: e.target.checked })}
              />
              <label htmlFor="booking_required" style={{ fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                Advance ticket or table booking required
              </label>
            </div>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-4)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <button type="button" onClick={onClose} className="btn btn-outline" disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <Spinner size="sm" /> : '💾 Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: AI SUBSTITUTE */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Want something different for this time slot? Tell AI what you're looking for, or leave it blank to get a fresh surprise that fits your vibe and location cluster.
            </p>

            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Currently Scheduled:</div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-main)', marginTop: '2px' }}>{activity.name}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-teal-300)' }}>
                {activity.time_slot} • {activity.location || 'Central area'}
              </div>
            </div>

            <div>
              <label className="form-label">Replacement Preference (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Something outdoors, more relaxed, or kid-friendly"
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-4)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <button type="button" onClick={onClose} className="btn btn-outline" disabled={replacing}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAiReplace}
                className="btn btn-primary"
                disabled={replacing}
              >
                {replacing ? (
                  <>
                    <Spinner size="sm" /> Replacing with AI...
                  </>
                ) : (
                  '✨ Generate Alternative Activity'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

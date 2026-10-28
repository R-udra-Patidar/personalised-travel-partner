import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTrips } from '../hooks/useTrips';
import TripCard from '../components/trip/TripCard';
import { Spinner, useToast } from '../components/ui';

export default function DashboardPage() {
  const { trips, loading, error, refetch, deleteTrip } = useTrips();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVibe, setFilterVibe] = useState('all');

  const handleDelete = async (id: string) => {
    try {
      await deleteTrip(id);
      showToast('Trip deleted successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete trip', 'error');
    }
  };

  // Filtered trips
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchSearch =
        trip.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchVibe = filterVibe === 'all' || trip.travel_vibe === filterVibe;
      return matchSearch && matchVibe;
    });
  }, [trips, searchTerm, filterVibe]);

  // Statistics
  const totalDays = useMemo(
    () => trips.reduce((sum, t) => sum + (t.travel_days || 0), 0),
    [trips]
  );
  const totalBudget = useMemo(
    () =>
      trips.reduce(
        (sum, t) => sum + (t.budget_estimate?.total_estimate || 0),
        0
      ),
    [trips]
  );

  return (
    <div className="container animate-fade">
      {/* Hero Welcome Banner */}
      <section
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(0, 245, 160, 0.12), transparent 70%), var(--color-bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-8) var(--space-6)',
          marginBottom: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0, 245, 160, 0.1)',
              border: '1px solid rgba(0, 245, 160, 0.3)',
              color: 'var(--color-teal-300)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              marginBottom: 'var(--space-3)',
            }}
          >
            <span>✨</span> AI-Powered Travel Experience
          </div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-2)', lineHeight: 1.2 }}>
            Your Personal <span className="text-gradient">Travel Companion</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)', lineHeight: 1.6 }}>
            Design bespoke day-by-day itineraries tailored to your vibe, budget, and travel style. Powered by Google Gemini AI.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
          <Link to="/new-trip" className="btn btn-primary">
            <span>✨</span> Create New Itinerary
          </Link>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            <span>📖</span> API Documentation
          </a>
        </div>

        {/* Quick Stats Grid */}
        {trips.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 'var(--space-4)',
              marginTop: 'var(--space-6)',
              paddingTop: 'var(--space-6)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-teal-300)' }}>
                {trips.length}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Planned Trips
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-gold-300)' }}>
                {totalDays}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Total Days
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-blue-300)' }}>
                ${totalBudget.toLocaleString()}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Total Estimated Budget
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Trips Section Header & Filters */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
            Saved Itineraries
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Manage and view all your customized travel plans
          </p>
        </div>

        {/* Search & Vibe Filters */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search destination..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px', width: '220px' }}
            />
            <span
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: 0.5,
              }}
            >
              🔍
            </span>
          </div>

          <select
            className="form-control"
            value={filterVibe}
            onChange={(e) => setFilterVibe(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="all">All Vibes</option>
            <option value="cultural">🏛️ Cultural</option>
            <option value="adventure">🏔️ Adventure</option>
            <option value="beach">🏖️ Beach</option>
            <option value="nature">🌿 Nature</option>
            <option value="relaxation">🧘 Relaxation</option>
            <option value="city">🌆 City</option>
            <option value="mixed">🎭 Mixed</option>
          </select>
        </div>
      </div>

      {/* Content States */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
          <Spinner size="lg" />
          <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
            Loading your journeys...
          </p>
        </div>
      ) : error ? (
        <div
          style={{
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>⚠️</div>
          <h3 style={{ color: '#ef4444', marginBottom: 'var(--space-2)' }}>Failed to load trips</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>{error}</p>
          <button onClick={refetch} className="btn btn-outline btn-sm">
            Try Again
          </button>
        </div>
      ) : trips.length === 0 ? (
        /* Empty State */
        <div className="empty-state animate-fade-up">
          <div className="empty-icon">🧭</div>
          <h3 className="empty-title">No trips planned yet</h3>
          <p className="empty-desc">
            Ready to explore? Tell us your vibe, duration, and budget, and let our AI craft your perfect itinerary.
          </p>
          <button
            onClick={() => navigate('/new-trip')}
            className="btn btn-primary"
            style={{ marginTop: 'var(--space-2)' }}
          >
            <span>✨</span> Start Planning Your First Trip
          </button>
        </div>
      ) : filteredTrips.length === 0 ? (
        /* No Search Match State */
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">No matching trips found</h3>
          <p className="empty-desc">
            Try adjusting your search terms or filter selection.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterVibe('all');
            }}
            className="btn btn-outline btn-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Grid of Trips */
        <div className="grid grid-3">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

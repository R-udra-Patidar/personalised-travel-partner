import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">✈️</span>
        <span className="text-gradient">TravelAI</span>
      </Link>

      {/* Nav Links */}
      <div className="navbar-nav">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <span>🏠</span>
          <span>Dashboard</span>
        </Link>
        <Link to="/new-trip" className={`nav-link ${isActive('/new-trip') ? 'active' : ''}`}>
          <span>✨</span>
          <span>New Trip</span>
        </Link>
        <Link to="/trips" className={`nav-link ${isActive('/trips') ? 'active' : ''}`}>
          <span>🗺️</span>
          <span>My Trips</span>
        </Link>
      </div>

      {/* Actions */}
      <div className="navbar-actions">
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
          data-tooltip="API Documentation"
        >
          📖 API Docs
        </a>
        <Link to="/new-trip" className="btn btn-primary btn-sm">
          + Plan Trip
        </Link>
      </div>
    </nav>
  );
}

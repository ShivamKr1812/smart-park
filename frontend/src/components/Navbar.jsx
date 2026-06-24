import React, { useState } from 'react';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar({ currentUser, currentPage, setCurrentPage, onLogout, darkMode, toggleDark }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isOwner = currentUser?.role === 'owner';

  const navLinks = [
    { id: 'dashboard', label: isOwner ? 'My Spots' : 'Dashboard', icon: isOwner ? '🅿️' : '🏠' },
  ];

  const navigate = (id) => {
    setCurrentPage(id);
    setMobileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="nav-brand" onClick={() => navigate('dashboard')}>
          <svg style={{ width: '26px', height: '26px', fill: 'url(#brandGrad)' }} viewBox="0 0 24 24">
            <defs>
              <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="var(--accent)" />
              </linearGradient>
            </defs>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h4c1.66 0 3 1.34 3 3s-1.34 3-3 3h-2v2zm0-4h2c.55 0 1-.45 1-1s-.45-1-1-1h-2v2z"/>
          </svg>
          SmartPark
        </div>

        {/* Desktop links */}
        <div className="nav-links">
          {navLinks.map(link => (
            <button
              key={link.id}
              className={`nav-link${currentPage === link.id ? ' active' : ''}`}
              onClick={() => navigate(link.id)}
            >
              <span className="nav-link-icon">{link.icon}</span>
              {link.label}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="nav-right">
          <button
            className="dark-toggle"
            onClick={toggleDark}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <ProfileDropdown 
            currentUser={currentUser} 
            onLogout={onLogout} 
            onNavigate={navigate} 
          />

          {/* Hamburger */}
          <button
            className={`hamburger${mobileOpen ? ' open' : ''}`}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            <button
              key={link.id}
              className={`mobile-nav-link${currentPage === link.id ? ' active' : ''}`}
              onClick={() => navigate(link.id)}
            >
              <span>{link.icon}</span>
              {link.label}
            </button>
          ))}
          <button className="mobile-nav-link logout-link" onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
  );
}

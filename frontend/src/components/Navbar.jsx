import React, { useState } from 'react';

export default function Navbar({ currentUser, currentPage, setCurrentPage, onLogout, darkMode, toggleDark }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isOwner = currentUser?.role === 'owner';
  const initials = (currentUser?.name || currentUser?.email || 'U').slice(0, 2).toUpperCase();

  const parkerLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'profile',   label: 'Profile',   icon: '👤' },
    { id: 'history',   label: 'My Bookings', icon: '📋' },
    { id: 'support',   label: 'Support',   icon: '💬' },
  ];
  const ownerLinks = [
    { id: 'dashboard', label: 'My Spots', icon: '🅿️' },
  ];
  const navLinks = isOwner ? ownerLinks : parkerLinks;

  const navigate = (id) => {
    setCurrentPage(id);
    setMobileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="nav-brand" onClick={() => navigate('dashboard')}>
          🅿️ SmartPark
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

          <div className="nav-avatar" title={currentUser?.email}>
            {initials}
          </div>

          <span className="nav-role-badge">
            {isOwner ? 'Owner' : 'Parker'}
          </span>

          <button className="btn btn-secondary btn-sm nav-logout" onClick={onLogout}>
            Logout
          </button>

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

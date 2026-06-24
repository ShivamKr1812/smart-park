import React, { useState, useEffect, useRef } from 'react';

export default function ProfileDropdown({ currentUser, onLogout, onNavigate }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isOwner = currentUser?.role === 'owner';
  const initials = (currentUser?.name || currentUser?.email || 'U').slice(0, 2).toUpperCase();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (id) => {
    onNavigate(id);
    setOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setOpen(false);
  };

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button 
        className="profile-dropdown-btn" 
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="nav-avatar" title="Profile Menu">
          {initials}
        </div>
      </button>

      {open && (
        <div className="profile-dropdown-menu">
          <div className="profile-dropdown-header">
            <div className="profile-dropdown-email">{currentUser?.email || 'user@example.com'}</div>
            <div className="profile-dropdown-role">{isOwner ? 'Park Owner' : 'Parker'}</div>
          </div>
          
          <div className="profile-dropdown-divider"></div>
          
          <button className="profile-dropdown-item" onClick={() => handleAction('profile')}>
            <span className="dropdown-icon">👤</span> Profile Page
          </button>
          
          {isOwner ? (
            <button className="profile-dropdown-item" onClick={() => handleAction('dashboard')}>
              <span className="dropdown-icon">🅿️</span> My Parking
            </button>
          ) : (
            <button className="profile-dropdown-item" onClick={() => handleAction('history')}>
              <span className="dropdown-icon">📋</span> Booking History
            </button>
          )}

          <button className="profile-dropdown-item" onClick={() => handleAction('support')}>
            <span className="dropdown-icon">💬</span> Support
          </button>

          <div className="profile-dropdown-divider"></div>
          
          <button className="profile-dropdown-item text-danger" onClick={handleLogout}>
            <span className="dropdown-icon">🚪</span> Logout
          </button>
        </div>
      )}
    </div>
  );
}

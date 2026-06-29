import React, { useState, useEffect, useRef } from 'react';
import { User, ClipboardList, HelpCircle, LogOut } from 'lucide-react';

export default function ProfileDropdown({ currentUser, onLogout, setCurrentPage }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isOwner = currentUser?.role === 'owner';
  const isAdmin = currentUser?.role === 'admin';
  const initials = (currentUser?.name || currentUser?.email || 'U').slice(0, 2).toUpperCase();

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
    setCurrentPage(id);
    setOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: '0.85rem',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s'
        }}
      >
        {initials}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div 
            className="glass-card" 
            style={{ 
              position: 'absolute', 
              right: 0, 
              top: '48px', 
              width: '240px', 
              padding: '0.8rem', 
              zIndex: 15, 
              animation: 'fadeIn 0.2s ease-out',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem'
            }}
          >
            {/* Header info */}
            <div style={{ padding: '0.4rem', borderBottom: '1px solid var(--border)', marginBottom: '0.4rem', textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text)', truncate: true }}>
                {currentUser?.name || 'Shivam Kumar'}
              </div>
              <div className="text-muted" style={{ fontSize: '0.7rem', truncate: true, marginTop: '0.1rem' }}>
                {currentUser?.email}
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.6rem', marginTop: '0.4rem', padding: '1px 5px' }}>
                {currentUser?.role?.toUpperCase()}
              </span>
            </div>

            {/* Profile page action */}
            {!isAdmin && (
              <button 
                className="nav-link w-full text-left" 
                style={{ justifyContent: 'start', gap: '0.6rem', padding: '0.5rem 0.8rem' }}
                onClick={() => handleAction('profile')}
              >
                <User size={14} /> Profile Page
              </button>
            )}

            {/* Role based page links */}
            {isOwner && (
              <button 
                className="nav-link w-full text-left" 
                style={{ justifyContent: 'start', gap: '0.6rem', padding: '0.5rem 0.8rem' }}
                onClick={() => handleAction('owner-dashboard')}
              >
                🚘 My Parking
              </button>
            )}

            {currentUser?.role === 'parker' && (
              <>
                <button 
                  className="nav-link w-full text-left" 
                  style={{ justifyContent: 'start', gap: '0.6rem', padding: '0.5rem 0.8rem' }}
                  onClick={() => handleAction('history')}
                >
                  <ClipboardList size={14} /> Bookings History
                </button>
                <button 
                  className="nav-link w-full text-left" 
                  style={{ justifyContent: 'start', gap: '0.6rem', padding: '0.5rem 0.8rem' }}
                  onClick={() => handleAction('support')}
                >
                  <HelpCircle size={14} /> Support Help
                </button>
              </>
            )}

            <div style={{ height: '1px', background: 'var(--border)', margin: '0.3rem 0' }} />

            <button 
              className="nav-link w-full text-left text-danger" 
              style={{ justifyContent: 'start', gap: '0.6rem', padding: '0.5rem 0.8rem', color: 'var(--danger)' }}
              onClick={handleLogout}
            >
              <LogOut size={14} /> Logout
            </button>

          </div>
        </>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import ProfileDropdown from './ProfileDropdown';
import { Bell, Sun, Moon, LogIn, UserPlus } from 'lucide-react';

export default function Navbar({ 
  currentUser, 
  currentPage, 
  setCurrentPage, 
  onLogout, 
  darkMode, 
  toggleDark,
  onLoginTrigger,
  onSignupTrigger
}) {
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Booking Confirmed", body: "Sector 62 spot booked for 2 hours.", read: false },
    { id: 2, title: "Low Balance Warning", body: "Your wallet balance is below ₹100.", read: true },
    { id: 3, title: "Time Expired", body: "Booking at Sector 21 expired 10m ago.", read: true }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navigate = (id) => {
    setCurrentPage(id);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo and Title */}
        <div className="nav-brand" onClick={() => navigate('dashboard')}>
          <svg style={{ width: '28px', height: '28px', fill: 'url(#brandRedesignGrad)' }} viewBox="0 0 24 24">
            <defs>
              <linearGradient id="brandRedesignGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h4c1.66 0 3 1.34 3 3s-1.34 3-3 3h-2v2zm0-4h2c.55 0 1-.45 1-1s-.45-1-1-1h-2v2z"/>
          </svg>
          <span style={{ fontWeight: '800', letterSpacing: '-0.04em' }}>Smart<span style={{ color: 'var(--primary)' }}>Park</span></span>
        </div>

        {/* Center Links (Desktop only, hidden on mobile) */}
        {currentUser && (
          <div className="nav-links">
            <button
              className={`nav-link${currentPage === 'dashboard' || currentPage === 'owner-dashboard' || currentPage === 'admin' ? ' active' : ''}`}
              onClick={() => {
                if (currentUser.role === 'admin') navigate('admin');
                else if (currentUser.role === 'owner') navigate('owner-dashboard');
                else navigate('dashboard');
              }}
            >
              🅿️ {currentUser.role === 'owner' ? 'My Spots' : currentUser.role === 'admin' ? 'Admin Dashboard' : 'Find Parking'}
            </button>

            {currentUser.role === 'parker' && (
              <>
                <button
                  className={`nav-link${currentPage === 'history' ? ' active' : ''}`}
                  onClick={() => navigate('history')}
                >
                  📋 Bookings
                </button>
                <button
                  className={`nav-link${currentPage === 'support' ? ' active' : ''}`}
                  onClick={() => navigate('support')}
                >
                  💬 Chat Support
                </button>
              </>
            )}
          </div>
        )}

        {/* Right Section: Notification Drawer, Theme Switch & Profile */}
        <div className="nav-right">
          {/* Theme Mode Switch */}
          <button
            className="dark-toggle"
            onClick={toggleDark}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {currentUser ? (
            <>
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button 
                  className="dark-toggle" 
                  onClick={() => setNotifsOpen(!notifsOpen)}
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '2px', right: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--danger)', color: 'white', fontSize: '0.65rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popup List */}
                {notifsOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setNotifsOpen(false)} />
                    <div className="glass-card" style={{ position: 'absolute', right: 0, top: '50px', width: '320px', padding: '1rem', zIndex: 15, animation: 'fadeIn 0.2s ease-out' }}>
                      <div className="flex-between pb-2 mb-2" style={{ borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Notifications</span>
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }} onClick={handleMarkAllRead}>
                          Mark all read
                        </button>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxH: '250px', overflowY: 'auto' }}>
                        {notifications.map(n => (
                          <div key={n.id} style={{ padding: '0.6rem', borderRadius: '8px', background: n.read ? 'transparent' : 'var(--primary-light)', fontSize: '0.75rem' }}>
                            <div style={{ fontWeight: '700', color: n.read ? 'var(--text)' : 'var(--primary)' }}>{n.title}</div>
                            <div className="text-muted" style={{ marginTop: '0.1rem' }}>{n.body}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Selection Dropdown */}
              <ProfileDropdown 
                currentUser={currentUser} 
                setCurrentPage={setCurrentPage} 
                onLogout={onLogout} 
              />
            </>
          ) : (
            // Authentication triggers for public users
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button className="btn btn-outline btn-sm" onClick={onLoginTrigger} style={{ gap: '0.3rem' }}>
                <LogIn size={14} /> Sign In
              </button>
              <button className="btn btn-primary btn-sm" onClick={onSignupTrigger} style={{ gap: '0.3rem' }}>
                <UserPlus size={14} /> Register
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

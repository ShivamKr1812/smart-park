import React, { useState, useEffect } from 'react';
import './App.css';
import AuthPage from './components/AuthPage';
import OwnerDashboard from './components/OwnerDashboard';
import ParkerDashboard from './components/ParkerDashboard';
import AdminDashboard from './components/AdminDashboard'; // We will create this next
import Navbar from './components/Navbar';
import ProfilePage from './components/ProfilePage';
import HistoryPage from './components/HistoryPage';
import SupportPage from './components/SupportPage';
import LandingPage from './components/LandingPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('smartpark-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchPreFill, setSearchPreFill] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('smartpark-theme') === 'dark';
  });

  // Apply dark mode to the HTML root element and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('smartpark-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('smartpark-user', JSON.stringify(user));
    setAuthModalOpen(false);

    // Redirect appropriately based on role
    if (user.role === 'admin') {
      setCurrentPage('admin');
    } else if (user.role === 'owner') {
      setCurrentPage('owner-dashboard');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('smartpark-user');
    setCurrentPage('dashboard');
  };

  const toggleDark = () => setDarkMode(prev => !prev);

  // Trigger login modal from landing page search
  const handleLandingGetStarted = (searchVal) => {
    setSearchPreFill(searchVal);
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  // Determine active view to render
  const renderPage = () => {
    if (!currentUser) {
      return <LandingPage onGetStarted={handleLandingGetStarted} />;
    }

    if (currentUser.role === 'admin') {
      return <AdminDashboard currentUser={currentUser} />;
    }

    if (currentUser.role === 'owner') {
      return <OwnerDashboard currentUser={currentUser} />;
    }

    switch (currentPage) {
      case 'profile':
        return <ProfilePage currentUser={currentUser} onUserUpdate={(updated) => {
          setCurrentUser(updated);
          localStorage.setItem('smartpark-user', JSON.stringify(updated));
        }} />;
      case 'history':
        return (
          <HistoryPage
            currentUser={currentUser}
            onGoToDashboard={() => setCurrentPage('dashboard')}
          />
        );
      case 'support':
        return <SupportPage />;
      default:
        return (
          <ParkerDashboard
            currentUser={currentUser}
            preFilledSearch={searchPreFill}
            clearPreFill={() => setSearchPreFill('')}
          />
        );
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar
        currentUser={currentUser}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
        darkMode={darkMode}
        toggleDark={toggleDark}
        onLoginTrigger={() => {
          setAuthMode('login');
          setAuthModalOpen(true);
        }}
        onSignupTrigger={() => {
          setAuthMode('signup');
          setAuthModalOpen(true);
        }}
      />

      <main className={currentUser ? "main-wrapper" : ""}>
        {renderPage()}
      </main>

      {/* Interactive Auth Overlay Modal */}
      {authModalOpen && (
        <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AuthPage
              initialMode={authMode}
              onLoginSuccess={handleLoginSuccess}
              onClose={() => setAuthModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Nav Bar (visible on parker dashboards when logged in) */}
      {currentUser && currentUser.role === 'parker' && (
        <div className="mobile-bottom-nav">
          <button
            className={`mobile-nav-btn${currentPage === 'dashboard' ? ' active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            🏠 <span>Explore</span>
          </button>
          <button
            className={`mobile-nav-btn${currentPage === 'history' ? ' active' : ''}`}
            onClick={() => setCurrentPage('history')}
          >
            📋 <span>Bookings</span>
          </button>

          {/* Floating Action Button to quickly jump to Search */}
          <button
            className="mobile-nav-fab"
            onClick={() => {
              setCurrentPage('dashboard');
              const searchInputEl = document.querySelector('.search-input');
              if (searchInputEl) searchInputEl.focus();
            }}
          >
            🔍
          </button>

          <button
            className={`mobile-nav-btn${currentPage === 'profile' ? ' active' : ''}`}
            onClick={() => setCurrentPage('profile')}
          >
            👤 <span>Profile</span>
          </button>
          <button
            className={`mobile-nav-btn${currentPage === 'support' ? ' active' : ''}`}
            onClick={() => setCurrentPage('support')}
          >
            💬 <span>Help</span>
          </button>
        </div>
      )}
    </div>
  );
}
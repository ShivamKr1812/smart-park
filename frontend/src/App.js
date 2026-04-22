import React, { useState, useEffect } from 'react';
import './App.css';
import AuthPage from './components/AuthPage';
import OwnerDashboard from './components/OwnerDashboard';
import ParkerDashboard from './components/ParkerDashboard';
import Navbar from './components/Navbar';
import ProfilePage from './components/ProfilePage';
import HistoryPage from './components/HistoryPage';
import SupportPage from './components/SupportPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('smartpark-theme') === 'dark';
  });

  // Apply dark mode to the HTML root element and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('smartpark-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  const toggleDark = () => setDarkMode(prev => !prev);

  // Show auth screen if not logged in
  if (!currentUser) {
    return <AuthPage onLoginSuccess={setCurrentUser} />;
  }

  const isOwner = currentUser.role === 'owner';

  const renderPage = () => {
    if (isOwner) {
      return <OwnerDashboard currentUser={currentUser} />;
    }
    switch (currentPage) {
      case 'profile':
        return <ProfilePage currentUser={currentUser} />;
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
        return <ParkerDashboard currentUser={currentUser} />;
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
      />
      <main className="main-wrapper">
        {renderPage()}
      </main>
    </div>
  );
}
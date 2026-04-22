import React, { useState, useEffect } from 'react';
import { api } from '../api';

const vehicleEmoji = { Car: '🚗', Bike: '🏍️', Truck: '🚛' };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

export default function HistoryPage({ currentUser, onGoToDashboard }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getBookingHistory(currentUser._id);
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, [currentUser._id]);

  return (
    <div className="page-wrapper">
      <div className="history-page">

        <div className="page-header">
          <div>
            <h2 className="page-title">📋 My Bookings</h2>
            <p className="page-subtitle">Your complete parking history</p>
          </div>
          {history.length > 0 && (
            <div className="history-summary-pill">
              {history.length} booking{history.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading your history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state-page">
            <div className="empty-icon">🅿️</div>
            <h3>No bookings yet</h3>
            <p>Your parking bookings will appear here once you make one.</p>
            <button className="btn btn-primary" onClick={onGoToDashboard}>
              Find Parking →
            </button>
          </div>
        ) : (
          <div className="history-list">
            {history.map(booking => (
              <div key={booking._id} className="history-card">
                <div className="history-card-left">
                  <div className="history-vehicle-badge">
                    {vehicleEmoji[booking.vehicleType] || '🚗'}
                  </div>
                  <div className="history-info">
                    <div className="history-name">{booking.parkingName}</div>
                    <div className="history-location">📍 {booking.location}</div>
                    <div className="history-meta">
                      <span>{booking.vehicleType}</span>
                      <span className="meta-dot">·</span>
                      <span>{formatDate(booking.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="history-card-right">
                  <div className="history-price">₹{booking.price}<span>/hr</span></div>
                  <span className={`status-badge status-${booking.status?.toLowerCase()}`}>
                    {booking.status || 'Completed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

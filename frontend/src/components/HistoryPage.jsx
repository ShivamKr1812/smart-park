import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Calendar, ShieldCheck, Clock, Plus, Ticket, Download, Share2 } from 'lucide-react';

const vehicleEmoji = { Car: '🚘', Bike: '🏍️', EV: '⚡', Truck: '🚚' };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

export default function HistoryPage({ currentUser, onGoToDashboard }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [currentUser._id]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getBookingHistory(currentUser._id);
      const data = res.data || [];
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getStatusBadge = (booking) => {
    if (booking.status === 'Checked-In') {
      return <span className="badge badge-warning" style={{ minWidth: '85px', textAlign: 'center' }}>🟠 Checked-In</span>;
    }
    if (booking.status === 'Completed' && booking.exitTime) {
      return <span className="badge badge-success" style={{ minWidth: '85px', textAlign: 'center' }}>🟢 Completed</span>;
    }
    return <span className="badge badge-primary" style={{ minWidth: '85px', textAlign: 'center', background: 'var(--secondary)' }}>🔵 Reserved</span>;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Top Header */}
      <div className="flex-between pb-4 mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: '800' }}>My Bookings</h2>
          <p className="text-muted text-sm font-light">Trace and manage your digital parking passes and tickets.</p>
        </div>
        {history.length > 0 && (
          <span className="badge badge-success">
            {history.length} Reservation{history.length !== 1 ? 's' : ''} Listed
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: '80px', width: '100%' }} />
          <div className="skeleton" style={{ height: '80px', width: '100%' }} />
        </div>
      ) : history.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.2rem' }}>📋</div>
          <h3>No bookings recorded yet</h3>
          <p className="text-muted text-xs mb-6">Your active and historical passes will map out in this catalog.</p>
          <button className="btn btn-primary" onClick={onGoToDashboard}>
            Find Parking Spots
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {history.map((booking) => {
            return (
              <div
                key={booking._id}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'between',
                  alignItems: 'center',
                  gap: '1.5rem',
                  borderColor: booking.status === 'Checked-In' ? 'var(--primary)' : 'var(--border)',
                  boxShadow: booking.status === 'Checked-In' ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
                }}
              >
                {/* Left section: details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flex: 1, minWidth: '280px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: booking.status === 'Checked-In' ? 'var(--primary-light)' : 'var(--surface-2)', color: booking.status === 'Checked-In' ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    {vehicleEmoji[booking.vehicleType] || '🚘'}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{booking.parkingName}</h3>
                    <p className="text-muted text-xs mt-0.5" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.75rem' }}>📍</span> {booking.location}
                    </p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: '600' }}>
                      <span>{booking.vehicleType} segment ({booking.vehicleNo || 'Unknown'})</span>
                      <span>•</span>
                      <span>Booked {formatDate(booking.date)}</span>
                    </div>

                    {/* Entry/Exit Timestamps */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.65rem', fontFamily: 'mono', color: 'var(--primary)' }}>
                      {booking.entryTime && (
                        <span>Entry: {new Date(booking.entryTime).toLocaleTimeString()}</span>
                      )}
                      {booking.exitTime && (
                        <span>Exit: {new Date(booking.exitTime).toLocaleTimeString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right section: Price, timer, and action buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.2rem', justifyContent: 'end' }}>
                  
                  {/* Price */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>₹{booking.price || 40}</div>
                    <span className="text-muted" style={{ fontSize: '0.65rem' }}>Tariff Charged</span>
                  </div>

                  {/* Status Badge */}
                  {getStatusBadge(booking)}

                  {/* Action Button */}
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedReceipt(booking)}
                    >
                      Ticket Pass
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Pass Drawer Overlay */}
      {selectedReceipt && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedReceipt(null)} />
          <div className="drawer-content" style={{ zIndex: 1100, display: 'flex', flexDirection: 'column', justify: 'between' }}>
            <div>
              <div className="flex-between pb-3 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-xs font-mono text-[#10b981] uppercase tracking-wider">Pass Details</span>
                <button className="btn-sm" style={{ background: 'var(--surface-2)', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '28px', height: '28px' }} onClick={() => setSelectedReceipt(null)}>✕</button>
              </div>

              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div className="checkmark-circle" style={{ background: selectedReceipt.status === 'Checked-In' ? 'var(--accent)' : 'var(--primary)' }}>
                  ✓
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                  {selectedReceipt.status === 'Checked-In' ? 'Checked-In' : selectedReceipt.exitTime ? 'Pass Completed' : 'Pass Authenticated'}
                </h3>
                <p className="text-muted text-xs mt-1 leading-relaxed">
                  Gate scanner entry authorization is active for this QR code.
                </p>

                {/* SVG Simulated QR code */}
                <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'white', display: 'inline-flex', border: '2px solid var(--primary-light)', borderRadius: 'var(--radius-lg)' }}>
                  <svg style={{ width: '120px', height: '120px', fill: '#111827' }} viewBox="0 0 100 100">
                    <rect x="5" y="5" width="25" height="25" stroke="#111827" strokeWidth="6" fill="none" />
                    <rect x="70" y="5" width="25" height="25" stroke="#111827" strokeWidth="6" fill="none" />
                    <rect x="5" y="70" width="25" height="25" stroke="#111827" strokeWidth="6" fill="none" />
                    <rect x="12" y="12" width="11" height="11" />
                    <rect x="77" y="12" width="11" height="11" />
                    <rect x="12" y="77" width="11" height="11" />
                    <rect x="40" y="5" width="6" height="15" />
                    <rect x="50" y="15" width="10" height="6" />
                    <rect x="40" y="30" width="15" height="15" />
                    <rect x="5" y="45" width="20" height="8" />
                    <rect x="75" y="40" width="12" height="18" />
                    <rect x="65" y="65" width="18" height="6" />
                    <rect x="40" y="60" width="6" height="25" />
                    <rect x="55" y="75" width="25" height="10" />
                  </svg>
                </div>

                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem', borderTop: '1px dashed var(--border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                  <div className="flex-between">
                    <span className="text-muted">Garage Name</span>
                    <strong>{selectedReceipt.parkingName}</strong>
                  </div>
                  <div className="flex-between">
                    <span className="text-muted">License Plate</span>
                    <strong>{selectedReceipt.vehicleNo || 'Unknown'}</strong>
                  </div>
                  <div className="flex-between">
                    <span className="text-muted">Vehicle Category</span>
                    <strong>{selectedReceipt.vehicleType}</strong>
                  </div>
                  <div className="flex-between">
                    <span className="text-muted">Verification Token</span>
                    <strong style={{ fontFamily: 'mono', color: 'var(--primary)' }}>
                      {selectedReceipt.verificationToken || 'SP-' + selectedReceipt._id}
                    </strong>
                  </div>
                  <div className="flex-between">
                    <span className="text-muted">Total Tariff Paid</span>
                    <strong>₹{selectedReceipt.price}</strong>
                  </div>
                  {selectedReceipt.entryTime && (
                    <div className="flex-between">
                      <span className="text-muted">Entry Timestamp</span>
                      <strong style={{ fontFamily: 'mono' }}>
                        {new Date(selectedReceipt.entryTime).toLocaleTimeString()}
                      </strong>
                    </div>
                  )}
                  {selectedReceipt.exitTime && (
                    <div className="flex-between">
                      <span className="text-muted">Exit Timestamp</span>
                      <strong style={{ fontFamily: 'mono' }}>
                        {new Date(selectedReceipt.exitTime).toLocaleTimeString()}
                      </strong>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <button className="btn btn-outline" style={{ flex: 1, gap: '0.3rem', fontSize: '0.8rem' }} onClick={() => alert("Downloaded PDF Receipt.")}>
                    Download
                  </button>
                  <button className="btn btn-outline" style={{ flex: 1, gap: '0.3rem', fontSize: '0.8rem' }} onClick={() => alert("Credentials shared.")}>
                    Share
                  </button>
                </div>
              </div>
            </div>
            
            <button className="btn btn-primary w-full mt-6" onClick={() => setSelectedReceipt(null)}>
              Close Ticket
            </button>
          </div>
        </>
      )}

    </div>
  );
}

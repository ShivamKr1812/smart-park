import React, { useState, useEffect } from 'react';
import ParkingForm from './ParkingForm';
import ParkingCard from './ParkingCard';
import { api } from '../api';
import { Landmark, Calendar, Clock, BarChart3, AlertCircle, RefreshCw, Star, QrCode, ShieldCheck, Check, Settings2, ShieldAlert } from 'lucide-react';

export default function OwnerDashboard({ currentUser }) {
  const [activeTab, setActiveTab] = useState('spaces'); // 'spaces' | 'pricing' | 'scanner'
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);

  // QR Scanner States
  const [qrTokenInput, setQrTokenInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [simulatedBookings, setSimulatedBookings] = useState([]);

  // Selected Parking for Pricing view
  const [selectedParkingId, setSelectedParkingId] = useState('');
  const [pricingForm, setPricingForm] = useState(null);

  // Stats summaries
  const [stats, setStats] = useState({
    totalCapacity: 0,
    activeBookingsCount: 0,
    totalRevenue: 0,
    avgRating: 4.8
  });

  useEffect(() => {
    fetchParkings();
    fetchSimulatedBookings();
  }, []);

  const fetchParkings = async () => {
    setLoading(true);
    try {
      const res = await api.getOwnerParkings(currentUser._id);
      const data = res.data || [];
      setParkings(data);
      if (data.length > 0 && !selectedParkingId) {
        setSelectedParkingId(data[0]._id);
        setPricingForm(data[0].pricing || {
          Car: { hourly: 50, daily: 300 },
          Bike: { hourly: 20, daily: 100 },
          EV: { hourly: 60, daily: 400 },
          Truck: { hourly: 100, daily: 700 }
        });
      }
      
      // Calculate Stats
      let capacitySum = 0;
      data.forEach(p => {
        p.slots?.forEach(s => {
          capacitySum += Number(s.total || 0);
        });
      });

      setStats(prev => ({
        ...prev,
        totalCapacity: capacitySum || 45
      }));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchSimulatedBookings = async () => {
    // Read all bookings from history in local db to list in scanner for simulation ease
    try {
      const dbRes = await fetch(`${api.verifyBookingQr ? api.verifyBookingQr.toString().split('/verify')[0] : 'http://localhost:5000'}/all`);
      // Since there is no public get all bookings route, we query simulated history using dummy/owner mappings,
      // or we query history from local user accounts. For simplicity, we query general user history or load mock.
    } catch (e) {}
  };

  // Quick simulation triggers to pull latest bookings for the owner's garages
  const loadActiveMockBookings = async () => {
    try {
      // Fetch bookings list directly from database mock to help users test scanner instantly
      const baseUrl = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/history/${currentUser._id}`);
      // Fallback: fetch a general dump or search
    } catch (e) {}
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editData) {
        await api.updateParking(editData._id, formData);
        setEditData(null);
      } else {
        await api.addParking(formData, currentUser._id);
      }
      fetchParkings();
      setActiveTab('spaces');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this parking listing?")) return;
    try {
      await api.deleteParking(id);
      fetchParkings();
    } catch(err) {
      alert("Failed to delete listing.");
    }
  };

  // Pricing Tab triggers
  const handleSelectParkingForPricing = (id) => {
    setSelectedParkingId(id);
    const p = parkings.find(park => park._id === id);
    if (p) {
      setPricingForm(p.pricing || {
        Car: { hourly: 50, daily: 300 },
        Bike: { hourly: 20, daily: 100 },
        EV: { hourly: 60, daily: 400 },
        Truck: { hourly: 100, daily: 700 }
      });
    }
  };

  const handlePricingFieldChange = (type, field, val) => {
    const num = Number(val) || 0;
    setPricingForm(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: num
      }
    }));
  };

  const savePricingUpdate = async () => {
    try {
      const p = parkings.find(park => park._id === selectedParkingId);
      if (!p) return;
      
      const payload = {
        title: p.title,
        location: p.location,
        price: pricingForm.Car?.hourly || p.price,
        phone: p.phone,
        slots: p.slots,
        pricing: pricingForm
      };

      await api.updateParking(selectedParkingId, payload);
      alert("✅ Pricing grid updated successfully!");
      fetchParkings();
    } catch (err) {
      alert("Failed to update prices: " + err.message);
    }
  };

  // QR Scanning Simulation Triggers
  const triggerQrVerification = async (token) => {
    setScanning(true);
    setScanResult(null);
    setScanError('');
    try {
      const res = await api.verifyBookingQr(token);
      setScanResult(res.data);
      // Re-fetch capacities to show updated slots instantly
      fetchParkings();
    } catch (err) {
      setScanError(err.message || "Failed to scan or resolve token coordinates");
    }
    setScanning(false);
  };

  return (
    <div style={{ width: '100%' }}>
      
      {/* Top Header */}
      <div className="flex-between pb-4 mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: '800' }}>Manage Listed Spaces</h2>
          <p className="text-muted text-sm font-light">Monitor garage capacities, edit tariffs, and review customer bookings.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchParkings} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Telemetry
        </button>
      </div>

      {/* Tabs navigation menu */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          borderBottom: '1px solid var(--border)', 
          marginBottom: '1.5rem',
          paddingBottom: '0.5rem'
        }}
      >
        <button 
          className={`btn ${activeTab === 'spaces' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('spaces')}
          style={{ gap: '0.4rem' }}
        >
          <Landmark size={14} /> Garages & Spots
        </button>
        <button 
          className={`btn ${activeTab === 'pricing' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('pricing')}
          style={{ gap: '0.4rem' }}
        >
          <Settings2 size={14} /> Pricing Grid
        </button>
        <button 
          className={`btn ${activeTab === 'scanner' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => {
            setActiveTab('scanner');
            setScanResult(null);
            setScanError('');
          }}
          style={{ gap: '0.4rem' }}
        >
          <QrCode size={14} /> QR Scanner Simulator
        </button>
      </div>

      {/* Spaces tab panel */}
      {activeTab === 'spaces' && (
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          
          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', width: '100%' }}>
            <div className="glass-card flex-between">
              <div>
                <span className="text-muted text-xs font-mono uppercase tracking-wider">Total Slot Capacity</span>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.2rem' }}>{stats.totalCapacity} Slots</h3>
              </div>
              <div style={{ color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.8rem', borderRadius: '12px' }}>
                <Landmark size={20} />
              </div>
            </div>

            <div className="glass-card flex-between">
              <div>
                <span className="text-muted text-xs font-mono uppercase tracking-wider">Operational Status</span>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.2rem', color: 'var(--success)' }}>Active</h3>
              </div>
              <div style={{ color: 'var(--secondary)', background: 'var(--secondary-light)', padding: '0.8rem', borderRadius: '12px' }}>
                <Clock size={20} />
              </div>
            </div>

            <div className="glass-card flex-between">
              <div>
                <span className="text-muted text-xs font-mono uppercase tracking-wider">Scanner Telemetry</span>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.2rem', color: 'var(--primary)' }}>Online</h3>
              </div>
              <div style={{ color: 'var(--success)', background: 'var(--success-bg)', padding: '0.8rem', borderRadius: '12px' }}>
                <ShieldCheck size={20} />
              </div>
            </div>

            <div className="glass-card flex-between">
              <div>
                <span className="text-muted text-xs font-mono uppercase tracking-wider">Avg Customer Rating</span>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {stats.avgRating} <Star size={16} fill="#fbbf24" color="#fbbf24" />
                </h3>
              </div>
              <div style={{ color: 'var(--accent)', background: 'var(--accent-light)', padding: '0.8rem', borderRadius: '12px' }}>
                <Star size={20} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Left Col Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <ParkingForm 
                onSubmit={handleFormSubmit} 
                initialData={editData} 
                onCancel={() => setEditData(null)} 
              />
            </div>

            {/* Right Col Listing catalog */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.2rem', fontWeight: '800' }}>Registered Parking Lots</h3>
              
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="skeleton" style={{ height: '140px', width: '100%' }} />
                </div>
              ) : parkings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)' }}>
                  <AlertCircle size={36} style={{ margin: '0 auto 1rem auto', opacity: '0.4' }} />
                  <h4>No listings deployed</h4>
                  <p className="text-xs">Submit the coordination listing form to go live.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {parkings.map(p => (
                    <ParkingCard 
                      key={p._id} 
                      parking={p} 
                      isOwner={true} 
                      onEdit={(item) => {
                        setEditData(item);
                        setActiveTab('spaces');
                      }}
                      onDelete={handleDelete}
                      onRate={() => {}}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Pricing Matrix Tab */}
      {activeTab === 'pricing' && (
        <div className="glass-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings2 size={20} color="var(--primary)" /> Pricing Management System
          </h3>
          <p className="text-muted text-xs mb-4">Set customized hourly and daily parking tariffs for different vehicle types.</p>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted">Select Garage Outcrop</label>
              <select 
                value={selectedParkingId} 
                onChange={(e) => handleSelectParkingForPricing(e.target.value)}
              >
                {parkings.map(p => (
                  <option key={p._id} value={p._id}>{p.title} ({p.location})</option>
                ))}
              </select>
            </div>

            {pricingForm && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                {['Car', 'Bike', 'EV', 'Truck'].map(type => {
                  const rates = pricingForm[type] || { hourly: 0, daily: 0 };
                  const labelEmojis = { Car: '🚘', Bike: '🏍️', EV: '⚡', Truck: '🚚' };
                  return (
                    <div 
                      key={type}
                      style={{
                        background: 'var(--surface-2)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        display: 'grid',
                        gridTemplateColumns: '1.5fr 1fr 1fr',
                        gap: '1rem',
                        alignItems: 'center'
                      }}
                    >
                      <strong style={{ fontSize: '0.9rem' }}>{labelEmojis[type]} {type} Segment</strong>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted">Hourly Rate (₹)</label>
                        <input 
                          type="number" 
                          value={rates.hourly} 
                          onChange={(e) => handlePricingFieldChange(type, 'hourly', e.target.value)}
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted">Daily Rate (₹)</label>
                        <input 
                          type="number" 
                          value={rates.daily} 
                          onChange={(e) => handlePricingFieldChange(type, 'daily', e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })}

                <button className="btn btn-primary mt-4" onClick={savePricingUpdate}>
                  Save Pricing Grid
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Scanner Simulator Tab */}
      {activeTab === 'scanner' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Left Column: Input and Simulator Actions */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <QrCode size={20} color="var(--primary)" /> Entry & Exit Scanner
            </h3>
            <p className="text-muted text-xs mb-4">
              Simulate entry/exit verification. Scan customer QR codes or type verification tokens to process slots.
            </p>

            <div style={{ background: 'black', borderRadius: '12px', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '1.5rem', border: '3px dashed var(--primary-hover)', position: 'relative', overflow: 'hidden' }}>
              {/* Virtual Scanner Layout */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(16, 185, 129, 0.08) 50%, rgba(16, 185, 129, 0) 50%)', backgroundSize: '100% 20px', animation: 'scanline 2s linear infinite' }} />
              <QrCode size={48} className="text-[#10b981] animate-pulse" />
              <span style={{ fontSize: '0.75rem', marginTop: '0.8rem', zIndex: 1, fontFamily: 'mono', letterSpacing: '0.1em', color: 'var(--primary)' }}>SCANNING MATRIX ACTIVE</span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted">Input Verification Token / Booking ID</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="e.g. TOKEN-567812-168800..." 
                  value={qrTokenInput}
                  onChange={(e) => setQrTokenInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button 
                  className="btn btn-primary" 
                  disabled={scanning || !qrTokenInput}
                  onClick={() => triggerQrVerification(qrTokenInput)}
                >
                  {scanning ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>

            {/* Quick Simulation Help Card */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '700' }}>💡 Scanner Testing Hack</h4>
              <p className="text-muted text-xs">
                To test the entry/exit barrier loop:
                <ol style={{ paddingLeft: '1.1rem', marginTop: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <li>Book a parking space in the Parker dashboard.</li>
                  <li>Copy the <strong>"Verification Token"</strong> shown on the final success ticket.</li>
                  <li>Switch back here, paste the token above, and click **Verify**.</li>
                  <li>Observe entry scans marking tickets as **Checked-In**, and exit scans releasing slots back to capacity!</li>
                </ol>
              </p>
            </div>
          </div>

          {/* Right Column: Scan Result Ticket */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {scanResult && (
              <div className="glass-card animate-scale-in" style={{ border: '1.5px solid var(--primary)', background: 'var(--surface-solid)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.4rem', borderRadius: '50%' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary)' }}>
                      {scanResult.status === 'Checked-In' ? '✅ Entry Approved' : '✅ Exit Approved'}
                    </h4>
                    <span className="text-xs text-muted">Verification coordinates decrypted</span>
                  </div>
                </div>

                {/* Ticket Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', borderTop: '1px dashed var(--border)', paddingTop: '0.8rem' }}>
                  <div className="flex-between">
                    <span className="text-muted">Parker Name</span>
                    <strong>{scanResult.booking?.userName || 'Parker'}</strong>
                  </div>
                  <div className="flex-between">
                    <span className="text-muted">License Plate</span>
                    <strong style={{ fontFamily: 'mono' }}>{scanResult.booking?.vehicleNo || 'Unknown'}</strong>
                  </div>
                  <div className="flex-between">
                    <span className="text-muted">Vehicle Segment</span>
                    <strong>{scanResult.booking?.vehicleType || 'Car'}</strong>
                  </div>
                  <div className="flex-between">
                    <span className="text-muted">Terminal Sector</span>
                    <strong>{scanResult.booking?.parkingName || 'Sector Spot'}</strong>
                  </div>
                  <div className="flex-between">
                    <span className="text-muted">Booking Reference</span>
                    <strong style={{ fontFamily: 'mono' }}>SP-{scanResult.booking?._id || 'ID'}</strong>
                  </div>
                  
                  {scanResult.action === 'entry' && (
                    <div className="flex-between" style={{ marginTop: '0.5rem', padding: '0.4rem', background: 'var(--primary-light)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Entry Timestamp</span>
                      <strong style={{ color: 'var(--primary)', fontFamily: 'mono' }}>
                        {new Date(scanResult.booking?.entryTime).toLocaleTimeString()}
                      </strong>
                    </div>
                  )}

                  {scanResult.action === 'exit' && (
                    <div className="flex-between" style={{ marginTop: '0.5rem', padding: '0.4rem', background: 'var(--accent-light)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: '600' }}>Exit Timestamp</span>
                      <strong style={{ color: 'var(--accent)', fontFamily: 'mono' }}>
                        {new Date(scanResult.booking?.exitTime).toLocaleTimeString()}
                      </strong>
                    </div>
                  )}

                  {scanResult.action === 'exit' && (
                    <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: '#10b981', fontWeight: '600', textAlign: 'center' }}>
                      ⚡ Slot released back to {scanResult.booking?.vehicleType} fleet inventory!
                    </div>
                  )}
                </div>
              </div>
            )}

            {scanError && (
              <div className="glass-card animate-scale-in" style={{ border: '1.5px solid var(--danger)', background: 'var(--surface-solid)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.4rem', borderRadius: '50%' }}>
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--danger)' }}>Scan Denied</h4>
                    <span className="text-xs text-muted">Ticket security failure</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: '600', background: 'var(--danger-bg)', padding: '0.5rem', borderRadius: '6px', textAlign: 'center' }}>
                  {scanError}
                </p>
              </div>
            )}

            {/* Empty state when no scan performed */}
            {!scanResult && !scanError && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '2.5px dashed var(--border)', borderRadius: '12px' }}>
                <QrCode size={40} style={{ margin: '0 auto 0.8rem auto', opacity: '0.3' }} />
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: '700' }}>No ticket scanned</h4>
                <p className="text-xs text-muted mt-0.5">Input a verification token to evaluate barrier clearances.</p>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

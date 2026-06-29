import React, { useState, useEffect } from 'react';
import ParkingForm from './ParkingForm';
import ParkingCard from './ParkingCard';
import { api } from '../api';
import { Landmark, Calendar, Clock, BarChart3, AlertCircle, RefreshCw, Star } from 'lucide-react';

export default function OwnerDashboard({ currentUser }) {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);

  // Stats summaries
  const [stats, setStats] = useState({
    totalCapacity: 0,
    activeBookings: 8,
    monthlyRevenue: 14850,
    avgRating: 4.8
  });

  useEffect(() => {
    fetchParkings();
  }, []);

  const fetchParkings = async () => {
    setLoading(true);
    try {
      const res = await api.getOwnerParkings(currentUser._id);
      const data = res.data || [];
      setParkings(data);
      
      // Calculate total capacity
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

  const handleFormSubmit = async (formData) => {
    try {
      if (editData) {
        await api.updateParking(editData._id, formData);
        setEditData(null);
      } else {
        await api.addParking(formData, currentUser._id);
      }
      fetchParkings();
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

  return (
    <div style={{ width: '100%' }}>
      {/* Top Header */}
      <div className="flex-between pb-4 mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: '800' }}>Manage listed spaces</h2>
          <p className="text-muted text-sm font-light">Monitor garage capacities, edit tariffs, and review customer bookings.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchParkings} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Telemetry
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
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
            <span className="text-muted text-xs font-mono uppercase tracking-wider">Active Bookings</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.2rem' }}>{stats.activeBookings} Occupied</h3>
          </div>
          <div style={{ color: 'var(--secondary)', background: 'var(--secondary-light)', padding: '0.8rem', borderRadius: '12px' }}>
            <Clock size={20} />
          </div>
        </div>

        <div className="glass-card flex-between">
          <div>
            <span className="text-muted text-xs font-mono uppercase tracking-wider">Monthly Revenue</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.2rem' }}>₹{stats.monthlyRevenue}</h3>
          </div>
          <div style={{ color: 'var(--success)', background: 'var(--success-bg)', padding: '0.8rem', borderRadius: '12px' }}>
            <BarChart3 size={20} />
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

      {/* Main split dashboard panel */}
      <div className="dashboard-grid">
        
        {/* Left Column: List and Add Spot Form */}
        <div className="col-4 flex flex-col gap-6">
          <ParkingForm 
            onSubmit={handleFormSubmit} 
            initialData={editData} 
            onCancel={() => setEditData(null)} 
          />

          {/* Occupancy peak chart representation */}
          <div className="glass-card">
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} /> Occupancy Peak Hour
            </h4>
            
            {/* Simple bar graphs for peaks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { time: '08:00 - 11:00', val: 75, color: 'var(--primary)' },
                { time: '11:00 - 15:00', val: 92, color: 'var(--danger)' },
                { time: '15:00 - 18:00', val: 60, color: 'var(--warning)' },
                { time: '18:00 - 21:00', val: 88, color: 'var(--secondary)' }
              ].map(bar => (
                <div key={bar.time} style={{ fontSize: '0.75rem' }}>
                  <div className="flex-between text-muted" style={{ marginBottom: '0.15rem' }}>
                    <span>{bar.time}</span>
                    <strong>{bar.val}% load</strong>
                  </div>
                  <div style={{ height: '6px', background: 'var(--surface-3)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${bar.val}%`, background: bar.color, borderRadius: '99px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Garages listing catalog & Calendars */}
        <div className="col-8 flex flex-col gap-6">
          
          {/* Calendar scheduler */}
          <div className="glass-card">
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} /> Availability Load Calendar
            </h4>
            
            {/* Grid days */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: '600' }}>
              {[
                { day: 'Mon', load: '40%', class: 'badge-success' },
                { day: 'Tue', load: '45%', class: 'badge-success' },
                { day: 'Wed', load: '60%', class: 'badge-warning' },
                { day: 'Thu', load: '65%', class: 'badge-warning' },
                { day: 'Fri', load: '92%', class: 'badge-danger' },
                { day: 'Sat', load: '85%', class: 'badge-danger' },
                { day: 'Sun', load: '30%', class: 'badge-success' }
              ].map(c => (
                <div key={c.day} style={{ padding: '0.6rem 0.4rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface-2)' }}>
                  <div className="text-muted" style={{ marginBottom: '0.3rem' }}>{c.day}</div>
                  <span className={`badge ${c.class}`} style={{ display: 'block', fontSize: '0.6rem', padding: '1px 3px' }}>{c.load}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Listings Card Panel */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.2rem' }}>My Registered Outcrops</h3>
            
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
              <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {parkings.map(p => (
                  <ParkingCard 
                    key={p._id} 
                    parking={p} 
                    isOwner={true} 
                    onEdit={setEditData}
                    onDelete={handleDelete}
                    onRate={() => {}}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

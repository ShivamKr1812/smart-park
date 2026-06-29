import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Cpu, ArrowUpRight, CheckCircle2, User, RefreshCw, BarChart } from 'lucide-react';
import { api } from '../api';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    usersCount: 0,
    ownersCount: 0,
    parkingsCount: 0,
    bookingsCount: 0,
    totalRevenue: 0
  });

  const [complaints, setComplaints] = useState([
    { id: 1, user: "Karan Johar", issue: "QR Scanner rejected gate code at Sector 62", status: "Open", date: "June 28" },
    { id: 2, user: "Nisha Patel", issue: "Double charge of ₹120 debited from wallet", status: "Resolved", date: "June 27" },
    { id: 3, user: "Rahul Sen", issue: "EV Charger was offline at basement spot B4", status: "Open", date: "June 29" }
  ]);

  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    setLoading(true);
    try {
      // Simulate retrieving aggregate data
      const parkingsRes = await api.getAllParkings();
      const parkings = parkingsRes.data || [];
      
      setStats({
        usersCount: 148,
        ownersCount: 22,
        parkingsCount: parkings.length || 6,
        bookingsCount: 423,
        totalRevenue: 54980
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleResolveComplaint = (id) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: "Resolved" } : c));
  };

  const runAiAnalysis = () => {
    setAiAnalyzing(true);
    setAiInsight(null);
    setTimeout(() => {
      setAiInsight({
        occupancy: "Sector 15 City Center experiences peak occupancy (94%) on Fridays between 17:00 and 20:00. Recommend scaling up surge coefficients by 1.2x to control congestion.",
        revenue: "Revenues grew 18.5% week-over-week. Top contributing sector: Mall Tectonic Parking Garage.",
        complaints: "Basement charger downtime forms 70% of active hardware reports. Advise routing immediate dispatch to technician."
      });
      setAiAnalyzing(false);
    }, 2000);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Top Header */}
      <div className="flex-between pb-4 mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Admin Console</h2>
          <p className="text-muted text-sm">Oversee global parkers, owners, transaction histories, and AI parameters.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchGlobalStats} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card flex-between">
          <div>
            <span className="text-muted text-xs font-mono uppercase tracking-wider">Registered Users</span>
            <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '0.2rem' }}>{stats.usersCount}</h3>
          </div>
          <div style={{ color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.8rem', borderRadius: '12px' }}>
            <User size={20} />
          </div>
        </div>

        <div className="glass-card flex-between">
          <div>
            <span className="text-muted text-xs font-mono uppercase tracking-wider">Active Bookings</span>
            <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '0.2rem' }}>{stats.bookingsCount}</h3>
          </div>
          <div style={{ color: 'var(--secondary)', background: 'var(--secondary-light)', padding: '0.8rem', borderRadius: '12px' }}>
            <Activity size={20} />
          </div>
        </div>

        <div className="glass-card flex-between">
          <div>
            <span className="text-muted text-xs font-mono uppercase tracking-wider">Registered Garages</span>
            <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '0.2rem' }}>{stats.parkingsCount}</h3>
          </div>
          <div style={{ color: 'var(--accent)', background: 'var(--accent-light)', padding: '0.8rem', borderRadius: '12px' }}>
            <BarChart size={20} />
          </div>
        </div>

        <div className="glass-card flex-between">
          <div>
            <span className="text-muted text-xs font-mono uppercase tracking-wider">Total System Revenue</span>
            <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '0.2rem' }}>₹{stats.totalRevenue}</h3>
          </div>
          <div style={{ color: 'var(--success)', background: 'var(--success-bg)', padding: '0.8rem', borderRadius: '12px' }}>
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>

      {/* Main dashboard splits */}
      <div className="dashboard-grid">
        {/* Left Column: Complaints & Support queues */}
        <div className="col-8 flex flex-col gap-6">
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} className="text-muted" /> Active Customer Complaints
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.8rem' }}>User</th>
                    <th style={{ padding: '0.8rem' }}>Issue Description</th>
                    <th style={{ padding: '0.8rem' }}>Date</th>
                    <th style={{ padding: '0.8rem' }}>Status</th>
                    <th style={{ padding: '0.8rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.8rem', fontWeight: '600' }}>{c.user}</td>
                      <td style={{ padding: '0.8rem', color: 'var(--text-muted)' }}>{c.issue}</td>
                      <td style={{ padding: '0.8rem' }}>{c.date}</td>
                      <td style={{ padding: '0.8rem' }}>
                        <span className={`badge ${c.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem', textAlign: 'right' }}>
                        {c.status === 'Open' ? (
                          <button className="btn btn-primary btn-sm" onClick={() => handleResolveComplaint(c.id)}>
                            Resolve
                          </button>
                        ) : (
                          <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <CheckCircle2 size={12} /> Closed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analytical Insights */}
        <div className="col-4">
          <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justify: 'between' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={18} className="text-muted" /> AI Insights Engine
              </h3>
              <p className="text-muted text-xs mb-6">Run predictive calculations on city parking density and occupancy behaviors.</p>

              {aiAnalyzing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div className="skeleton" style={{ height: '50px', width: '100%' }} />
                  <div className="skeleton" style={{ height: '40px', width: '90%' }} />
                  <div className="skeleton" style={{ height: '60px', width: '95%' }} />
                </div>
              )}

              {aiInsight && !aiAnalyzing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--primary-light)', borderLeft: '3px solid var(--primary)', borderRadius: '0.5rem', fontSize: '0.8rem', lineHeight: '1.5' }}>
                    <strong>Density surges:</strong> {aiInsight.occupancy}
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--secondary-light)', borderLeft: '3px solid var(--secondary)', borderRadius: '0.5rem', fontSize: '0.8rem', lineHeight: '1.5' }}>
                    <strong>Revenue tracks:</strong> {aiInsight.revenue}
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--accent-light)', borderLeft: '3px solid var(--accent)', borderRadius: '0.5rem', fontSize: '0.8rem', lineHeight: '1.5' }}>
                    <strong>Hardware health:</strong> {aiInsight.complaints}
                  </div>
                </div>
              )}

              {!aiInsight && !aiAnalyzing && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-light)' }}>
                  <Cpu size={30} style={{ margin: '0 auto 1rem auto', opacity: '0.4' }} />
                  <p className="text-xs">No analysis compiled yet. Run telemetry below.</p>
                </div>
              )}
            </div>

            <button 
              className="btn btn-primary w-full mt-6" 
              onClick={runAiAnalysis}
              disabled={aiAnalyzing}
            >
              {aiAnalyzing ? 'Analyzing System...' : 'Run Telemetry Scan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

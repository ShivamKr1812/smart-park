import React, { useState } from 'react';
import { User, ShieldCheck, Car, Wallet, Plus, CreditCard, Sparkles, RefreshCw, Trash2 } from 'lucide-react';

export default function ProfilePage({ currentUser, onUserUpdate }) {
  const [activeSubTab, setActiveSubTab] = useState('account'); // 'account', 'vehicles', 'wallet'
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Account Form state
  const [form, setForm] = useState({
    name: currentUser?.name || 'Shivam Kumar',
    email: currentUser?.email || 'shivam@park.com',
    phone: currentUser?.phone || '9876543210'
  });

  // Wallet State
  const [rechargeAmt, setRechargeAmt] = useState('');
  const [recharging, setRecharging] = useState(false);
  const [walletHistory, setWalletHistory] = useState([
    { id: 1, type: "Top Up", amt: 500, date: "June 25", status: "Success" },
    { id: 2, type: "Booking Fee", amt: -60, date: "June 26", status: "Completed" },
    { id: 3, type: "Refund Credit", amt: 120, date: "June 27", status: "Success" }
  ]);

  // Vehicles list state
  const [vehicles, setVehicles] = useState(
    currentUser?.vehicles || [
      { plate: "DL-3C-AM-1234", model: "Maruti Swift", color: "White", type: "Car" },
      { plate: "UP-16-CZ-5678", model: "Yamaha R15", color: "Blue", type: "Bike" }
    ]
  );
  const [newVehicle, setNewVehicle] = useState({ plate: '', model: '', color: '', type: 'Car' });

  const initials = (form.name || form.email || 'U').slice(0, 2).toUpperCase();
  const roleLabel = currentUser?.role === 'owner' ? 'Park Owner' : 'Parker';

  const handleSaveAccount = () => {
    setEditing(false);
    setSaved(true);
    if (onUserUpdate) {
      onUserUpdate({
        ...currentUser,
        name: form.name,
        phone: form.phone
      });
    }
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newVehicle.plate || !newVehicle.model) {
      alert("Please fill all required vehicle fields.");
      return;
    }
    const updated = [...vehicles, newVehicle];
    setVehicles(updated);
    if (onUserUpdate) {
      onUserUpdate({
        ...currentUser,
        vehicles: updated
      });
    }
    setNewVehicle({ plate: '', model: '', color: '', type: 'Car' });
  };

  const handleDeleteVehicle = (plate) => {
    const updated = vehicles.filter(v => v.plate !== plate);
    setVehicles(updated);
    if (onUserUpdate) {
      onUserUpdate({
        ...currentUser,
        vehicles: updated
      });
    }
  };

  const handleWalletRecharge = () => {
    const amt = parseFloat(rechargeAmt);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid positive top up value.");
      return;
    }
    setRecharging(true);
    setTimeout(() => {
      const updatedBalance = Number(currentUser?.wallet || 0) + amt;
      if (onUserUpdate) {
        onUserUpdate({
          ...currentUser,
          wallet: updatedBalance
        });
      }
      setWalletHistory(prev => [
        { id: Date.now(), type: "Top Up", amt, date: "Today", status: "Success" },
        ...prev
      ]);
      setRechargeAmt('');
      setRecharging(false);
      alert(`💳 Successfully topped up ₹${amt} to your digital wallet!`);
    }, 1500);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Upper header */}
      <div className="glass-card mb-8" style={{ padding: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '800' }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{form.name}</h2>
          <p className="text-muted text-sm">{form.email}</p>
          <span className="badge badge-success mt-2">{roleLabel} Profile</span>
        </div>

        {/* Dynamic sub tab picker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '180px' }}>
          <button 
            className={`btn btn-sm ${activeSubTab === 'account' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveSubTab('account')}
          >
            👤 Account Details
          </button>
          <button 
            className={`btn btn-sm ${activeSubTab === 'vehicles' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveSubTab('vehicles')}
          >
            🚘 My Vehicles
          </button>
          <button 
            className={`btn btn-sm ${activeSubTab === 'wallet' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveSubTab('wallet')}
          >
            💳 Wallet & Payments
          </button>
        </div>
      </div>

      {saved && (
        <div className="badge badge-success mb-4 w-full justify-center py-2" style={{ fontSize: '0.9rem' }}>
          ✓ Account configurations saved successfully!
        </div>
      )}

      {/* Sub tabs displays */}
      <div className="dashboard-grid">
        
        {/* Main interactive panel */}
        <div className="col-8">
          {activeSubTab === 'account' && (
            <div className="glass-card">
              <div className="flex-between mb-6 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Personal Coordinates</h3>
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(!editing)}>
                  {editing ? 'Cancel' : 'Edit Credentials'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    disabled={!editing}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted">Registered Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                  />
                  <span className="text-muted" style={{ fontSize: '0.65rem' }}>Email coordinates cannot be altered.</span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted">Comm Phone Coordinates</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    disabled={!editing}
                  />
                </div>
              </div>

              {editing && (
                <button className="btn btn-primary w-full mt-6" onClick={handleSaveAccount}>
                  Save Profile Settings
                </button>
              )}
            </div>
          )}

          {activeSubTab === 'vehicles' && (
            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>My Registered Fleet</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {vehicles.map(v => (
                  <div key={v.plate} className="flex-between p-4" style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontSize: '1.5rem' }}>{vehicleEmoji[v.type] || '🚘'}</div>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{v.model} ({v.color})</strong>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'mono', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{v.plate}</div>
                      </div>
                    </div>
                    <button 
                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                      onClick={() => handleDeleteVehicle(v.plate)}
                      title="Remove Vehicle"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add vehicle form */}
              <form onSubmit={handleAddVehicle} style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Add New Vehicle</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted">Vehicle Type</label>
                    <select 
                      value={newVehicle.type} 
                      onChange={e => setNewVehicle({ ...newVehicle, type: e.target.value })}
                    >
                      <option value="Car">Car</option>
                      <option value="Bike">Bike</option>
                      <option value="EV">EV</option>
                      <option value="Truck">Truck</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted">Model Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Fortuner / Splendor"
                      value={newVehicle.model}
                      onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.2rem' }}>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted">License Plate Number</label>
                    <input
                      type="text"
                      placeholder="UP-16-CZ-1234"
                      value={newVehicle.plate}
                      onChange={e => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted">Vehicle Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Red / Black"
                      value={newVehicle.color}
                      onChange={e => setNewVehicle({ ...newVehicle, color: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full" style={{ gap: '0.3rem' }}>
                  <Plus size={16} /> Add Vehicle Profile
                </button>
              </form>
            </div>
          )}

          {activeSubTab === 'wallet' && (
            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wallet size={18} /> Wallet Gateway
              </h3>
              <p className="text-muted text-xs mb-6">Recharge instantly via linked cards or UPI channels.</p>

              <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem' }}>
                <input
                  type="number"
                  placeholder="Enter top up amount (₹)"
                  value={rechargeAmt}
                  onChange={e => setRechargeAmt(e.target.value)}
                  style={{ flex: 1 }}
                  min="1"
                />
                <button 
                  className="btn btn-primary" 
                  onClick={handleWalletRecharge}
                  disabled={recharging}
                  style={{ gap: '0.4rem' }}
                >
                  {recharging ? <RefreshCw size={14} className="animate-spin" /> : <CreditCard size={14} />} Recharge
                </button>
              </div>

              {/* Transaction history list */}
              <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Transaction History</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {walletHistory.map(w => (
                  <div key={w.id} className="flex-between p-3.5" style={{ background: 'var(--surface-solid)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                      <strong>{w.type}</strong>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>{w.date}</span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color: w.amt > 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {w.amt > 0 ? `+₹${w.amt}` : `-₹${Math.abs(w.amt)}`}
                      </strong>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>{w.status}</div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* Right side: Security settings / credentials badge */}
        <div className="col-4">
          <div className="glass-card" style={{ text: 'center' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <ShieldCheck size={20} />
            </div>
            
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800' }}>Security Coordinates</h4>
            <p className="text-muted text-xs mt-1 leading-relaxed">
              Your account coordinates are fully encrypted with JWT parameters and rate limiting guards.
            </p>
            
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.2rem', paddingTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', textAlign: 'left' }}>
              <div className="flex-between">
                <span className="text-muted">Account State</span>
                <span className="badge badge-success">ACTIVE</span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Verification Level</span>
                <strong>Level 2 (OTP Pass)</strong>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const vehicleEmoji = { Car: '🚘', Bike: '🏍️', EV: '⚡', Truck: '🚚' };

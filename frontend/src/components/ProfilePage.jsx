import React, { useState } from 'react';

export default function ProfilePage({ currentUser }) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name:  currentUser?.name  || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
  });

  const initials = (form.name || form.email || 'U').slice(0, 2).toUpperCase();
  const roleLabel = currentUser?.role === 'owner' ? 'Park Owner' : 'Parker';

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-wrapper">
      <div className="profile-page">

        {/* Header card */}
        <div className="profile-header-card">
          <div className="profile-avatar-large">{initials}</div>
          <div className="profile-header-info">
            <h2 className="profile-name">{form.name || 'Unnamed User'}</h2>
            <p className="profile-email">{form.email}</p>
            <span className="profile-role-pill">{roleLabel}</span>
          </div>
        </div>

        {/* Success toast */}
        {saved && (
          <div className="toast toast-success">
            ✅ Profile updated successfully!
          </div>
        )}

        {/* Info card */}
        <div className="profile-info-card">
          <div className="profile-card-header">
            <h3>Personal Information</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setEditing(e => !e); setSaved(false); }}
            >
              {editing ? '✕ Cancel' : '✏️ Edit'}
            </button>
          </div>

          <div className="profile-fields">
            <div className="profile-field">
              <label>Full Name</label>
              <input
                className="input-field"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                disabled={!editing}
                placeholder="Your full name"
              />
            </div>
            <div className="profile-field">
              <label>Email Address</label>
              <input
                className="input-field"
                value={form.email}
                disabled
                placeholder="your@email.com"
              />
              <span className="field-hint">Email cannot be changed</span>
            </div>
            <div className="profile-field">
              <label>Phone Number</label>
              <input
                className="input-field"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                disabled={!editing}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          {editing && (
            <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={handleSave}>
              💾 Save Changes
            </button>
          )}
        </div>

        {/* Stats card */}
        <div className="profile-stats-card">
          <div className="stat-item">
            <span className="stat-value">🏷️</span>
            <span className="stat-label">Member since {new Date().getFullYear()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">🔒</span>
            <span className="stat-label">Account Verified</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">🌟</span>
            <span className="stat-label">Trusted {roleLabel}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

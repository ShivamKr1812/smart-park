import React, { useState, useEffect } from 'react';

const VEHICLE_TYPES = ['Bike', 'Car', 'Truck'];

export default function ParkingForm({ onSubmit, initialData, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    location: '',
    price: '',
    phone: '',
    slots: [] // Array of { type: 'Bike', total: 10, available: 10 }
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSlotChange = (type, value) => {
    const total = parseInt(value) || 0;
    const existingSlots = [...form.slots];
    const index = existingSlots.findIndex(s => s.type === type);
    
    if (index >= 0) {
      if (total === 0) {
         existingSlots.splice(index, 1);
      } else {
         existingSlots[index].total = total;
         // Adjust available slots based on initial state assuming UI only 
         // Real app would calculate diff but mock assumes reset or simple logic
         existingSlots[index].available = total; 
      }
    } else if (total > 0) {
      existingSlots.push({ type, total, available: total });
    }
    
    setForm({ ...form, slots: existingSlots });
  };

  const getSlotValue = (type) => {
    const slot = form.slots.find(s => s.type === type);
    return slot ? slot.total : '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.location || !form.price || form.slots.length === 0) {
      alert("Please fill all required fields and add at least one vehicle slot.");
      return;
    }
    onSubmit(form);
    if (!initialData) {
      setForm({ title: '', location: '', price: '', phone: '', slots: [] });
    }
  };

  return (
    <div className="form-panel">
      <h3>{initialData ? '✨ Edit Parking Spot' : '✨ Add New Spot'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input className="input-field" name="title" value={form.title} onChange={handleChange} placeholder="e.g. City Center Mall" />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input className="input-field" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Noida, India" />
        </div>
        <div className="form-group">
          <label>Price (per hr)</label>
          <input className="input-field" name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g. 50" />
        </div>
        <div className="form-group">
          <label>Contact Phone</label>
          <input className="input-field" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. +91 9876543210" />
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label style={{ fontSize: '1rem', color: '#1e293b' }}>Vehicle Slots (Total Capacity)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
            {VEHICLE_TYPES.map(vt => (
              <div key={vt} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>{vt}</label>
                <input 
                  type="number" 
                  min="0"
                  className="input-field" 
                  style={{ width: '100%', padding: '0.5rem' }}
                  placeholder="0"
                  value={getSlotValue(vt)}
                  onChange={(e) => handleSlotChange(vt, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            {initialData ? 'Update Spot' : 'Add Spot'}
          </button>
          {initialData && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

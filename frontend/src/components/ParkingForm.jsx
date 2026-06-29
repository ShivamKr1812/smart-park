import React, { useState, useEffect } from 'react';

const VEHICLE_TYPES = ['Car', 'Bike', 'EV', 'Truck'];
const VEHICLE_EMOJIS = { Car: '🚘', Bike: '🏍️', EV: '⚡', Truck: '🚚' };

export default function ParkingForm({ onSubmit, initialData, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    location: '',
    price: '',
    phone: '',
    slots: [] // Array of { type: 'Car', total: 10, available: 10 }
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
      alert("Please fill all required fields and register at least one vehicle slot.");
      return;
    }
    onSubmit(form);
    if (!initialData) {
      setForm({ title: '', location: '', price: '', phone: '', slots: [] });
    }
  };

  return (
    <div className="glass-card" style={{ border: '1px solid var(--border)', background: 'var(--surface-solid)' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.2rem', fontWeight: '800' }}>
        {initialData ? '✨ Edit Parking Coordinates' : '✨ List New Garage'}
      </h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted">Garage Title / Name</label>
          <input 
            name="title" 
            value={form.title} 
            onChange={handleChange} 
            placeholder="e.g. City Center Plaza Lot" 
            required
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted">Physical Address / Locality</label>
          <input 
            name="location" 
            value={form.location} 
            onChange={handleChange} 
            placeholder="e.g. Sector 62, Noida" 
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted">Tariff (₹ / Hour)</label>
            <input 
              name="price" 
              type="number" 
              value={form.price} 
              onChange={handleChange} 
              placeholder="e.g. 50" 
              min="0"
              required
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted">Contact Phone Coordinates</label>
            <input 
              name="phone" 
              value={form.phone} 
              onChange={handleChange} 
              placeholder="e.g. 9876543210" 
              required
            />
          </div>
        </div>

        {/* Slot Capacity Grids */}
        <div className="flex flex-col gap-1.5" style={{ marginTop: '0.5rem' }}>
          <label className="text-xs font-semibold text-muted">Terminal Slot Capacities</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
            {VEHICLE_TYPES.map(vt => (
              <div 
                key={vt} 
                style={{ 
                  background: 'var(--surface-2)', 
                  padding: '0.6rem 0.4rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border)',
                  textAlign: 'center'
                }}
              >
                <span style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                  {VEHICLE_EMOJIS[vt]}
                </span>
                <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.3rem' }}>
                  {vt}
                </span>
                <input 
                  type="number" 
                  min="0"
                  style={{ width: '100%', padding: '0.3rem', textAlign: 'center', fontSize: '0.8rem' }}
                  placeholder="0"
                  value={getSlotValue(vt)}
                  onChange={(e) => handleSlotChange(vt, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          {initialData && (
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
            {initialData ? 'Update Coordinates' : 'Deploy Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}

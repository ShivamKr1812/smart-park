import React from 'react';
import { Shield, Eye, BatteryCharging, Zap, Accessibility, Clock } from 'lucide-react';

const VEHICLE_TYPES = ['Car', 'Bike', 'EV', 'Truck'];
const VEHICLE_ICONS = { Car: '🚘', Bike: '🏍️', EV: '⚡', Truck: '🚚' };

export default function FilterBar({ filters, setFilters }) {
  const setVehicle = (type) => setFilters({ ...filters, vehicleType: type });

  const handleChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleCheckbox = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.checked });

  return (
    <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'between', alignItems: 'center' }}>
        
        {/* Vehicle Type Selection */}
        <div style={{ flex: 1, minWidth: '260px' }}>
          <span className="text-muted text-xs font-semibold uppercase tracking-wider block mb-2">Vehicle Category</span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${filters.vehicleType === 'All' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setVehicle('All')}
              style={{ borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem' }}
            >
              🌐 All
            </button>
            {VEHICLE_TYPES.map(vt => (
              <button
                key={vt}
                className={`btn btn-sm ${filters.vehicleType === vt ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setVehicle(vt)}
                style={{ borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem' }}
              >
                {VEHICLE_ICONS[vt]} {vt}
              </button>
            ))}
          </div>
        </div>

        {/* Max price per hour */}
        <div style={{ width: '160px' }}>
          <span className="text-muted text-xs font-semibold uppercase tracking-wider block mb-2">Max Price (₹/hr)</span>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder="e.g. 80"
            min="0"
            style={{ padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}
          />
        </div>

        {/* Availability Switch Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', alignSelf: 'end', paddingBottom: '0.4rem' }}>
          <input
            type="checkbox"
            id="availableOnly"
            name="availableOnly"
            checked={filters.availableOnly}
            onChange={handleCheckbox}
            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
          <label htmlFor="availableOnly" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text)', cursor: 'pointer' }}>
            Available Slots Only
          </label>
        </div>

      </div>

      {/* Advanced Amenities Filters Section */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <span className="text-muted text-xs font-semibold uppercase tracking-wider block mb-2.5">Specific Amenities Filters</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', alignItems: 'center' }}>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              name="covered"
              checked={filters.covered}
              onChange={handleCheckbox}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <Shield size={12} /> Covered Parking
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              name="cctv"
              checked={filters.cctv}
              onChange={handleCheckbox}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <Eye size={12} /> CCTV Surveillance
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              name="ev"
              checked={filters.ev}
              onChange={handleCheckbox}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <BatteryCharging size={12} /> EV Charging Ports
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              name="valet"
              checked={filters.valet}
              onChange={handleCheckbox}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <Zap size={12} /> Valet Service
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              name="accessible"
              checked={filters.accessible}
              onChange={handleCheckbox}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <Accessibility size={12} /> Disabled Friendly
          </label>

        </div>
      </div>
    </div>
  );
}

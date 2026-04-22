import React from 'react';

const VEHICLE_TYPES = ['Bike', 'Car', 'Truck'];
const VEHICLE_ICONS = { Bike: '🏍️', Car: '🚗', Truck: '🚛' };

export default function FilterBar({ filters, setFilters }) {
  const setVehicle = (type) => setFilters({ ...filters, vehicleType: type });

  const handleChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleCheckbox = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.checked });

  return (
    <div className="filter-bar">
      {/* Vehicle Type Pills */}
      <div className="filter-group">
        <label className="filter-label">Vehicle Type</label>
        <div className="vehicle-pills">
          <button
            className={`vehicle-pill${filters.vehicleType === 'All' ? ' active' : ''}`}
            onClick={() => setVehicle('All')}
          >
            🚘 All
          </button>
          {VEHICLE_TYPES.map(vt => (
            <button
              key={vt}
              className={`vehicle-pill${filters.vehicleType === vt ? ' active' : ''}`}
              onClick={() => setVehicle(vt)}
            >
              {VEHICLE_ICONS[vt]} {vt}
            </button>
          ))}
        </div>
      </div>

      {/* Max Price */}
      <div className="filter-group filter-group-sm">
        <label className="filter-label">Max Price (₹/hr)</label>
        <input
          type="number"
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleChange}
          className="filter-input-text"
          placeholder="e.g. 100"
          min="0"
        />
      </div>

      {/* Available Only */}
      <div className="filter-group filter-checkbox-group">
        <label className="filter-label" htmlFor="availableOnly">Availability</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            id="availableOnly"
            name="availableOnly"
            checked={filters.availableOnly}
            onChange={handleCheckbox}
          />
          <span className="toggle-slider" />
          <span className="toggle-text">Available only</span>
        </label>
      </div>
    </div>
  );
}

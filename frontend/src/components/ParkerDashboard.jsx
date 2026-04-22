import React, { useState, useEffect } from 'react';
import FilterBar from './FilterBar';
import ParkingCard from './ParkingCard';
import { api } from '../api';

export default function ParkerDashboard({ currentUser }) {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [filters, setFilters] = useState({
    vehicleType: 'All',
    maxPrice: '',
    availableOnly: false,
  });

  useEffect(() => { fetchParkings(); }, []);

  const fetchParkings = async () => {
    setLoading(true);
    try {
      const res = await api.getAllParkings();
      setParkings(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleBook = async (parkingId, vehicleType) => {
    try {
      await api.bookParking(parkingId, vehicleType, currentUser?._id);
      alert(`✅ Successfully booked a ${vehicleType} slot!`);
      fetchParkings();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRate = async (parkingId, rating) => {
    try {
      await api.rateParking(parkingId, rating);
      fetchParkings();
    } catch {
      alert('Failed to save rating');
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const locality =
            data.address.city || data.address.town ||
            data.address.suburb || data.address.village || data.address.county || '';
          if (locality) setSearchQuery(locality);
          else alert('Could not determine location name.');
        } catch {
          alert('Failed to get location name.');
        }
        setIsLocating(false);
      },
      () => { alert('Failed to access location.'); setIsLocating(false); }
    );
  };

  // Filtering logic
  const filteredData = parkings.filter(p => {
    if (searchQuery && !(
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )) return false;

    if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;

    if (filters.vehicleType !== 'All') {
      const slot = p.slots.find(s => s.type === filters.vehicleType);
      if (!slot) return false;
      if (filters.availableOnly && slot.available <= 0) return false;
    } else if (filters.availableOnly) {
      if (!p.slots.some(s => s.available > 0)) return false;
    }

    return true;
  });

  return (
    <div style={{ width: '100%' }}>
      {/* Hero search section */}
      <div className="hero-section">
        <h1>Find Secure Parking Near You</h1>
        <p>Thousands of secure spaces available for instant booking.</p>
        <div className="search-wrapper">
          <div className="search-bar-container">
            <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by location or name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')} title="Clear">✕</button>
            )}
          </div>
          <button
            className={`location-btn${isLocating ? ' locating' : ''}`}
            onClick={handleUseLocation}
            disabled={isLocating}
            title="Use My Location"
          >
            📍 {isLocating ? 'Locating...' : 'Near Me'}
          </button>
        </div>
      </div>

      {/* Filter bar + cards */}
      <div className="dashboard-container">
        <FilterBar filters={filters} setFilters={setFilters} />

        <div style={{ marginTop: '1.5rem' }}>
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading available spots...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3>No spots match your search</h3>
              <p>Try adjusting your filters or search term.</p>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}
                onClick={() => { setSearchQuery(''); setFilters({ vehicleType: 'All', maxPrice: '', availableOnly: false }); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <p className="results-count">{filteredData.length} spot{filteredData.length !== 1 ? 's' : ''} found</p>
              <div className="cards-grid">
                {filteredData.map(p => (
                  <ParkingCard
                    key={p._id}
                    parking={p}
                    isOwner={false}
                    onBook={handleBook}
                    onRate={handleRate}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

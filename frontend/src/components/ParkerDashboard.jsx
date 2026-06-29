import React, { useState, useEffect } from 'react';
import FilterBar from './FilterBar';
import ParkingCard from './ParkingCard';
import BookingFlow from './BookingFlow';
import { api } from '../api';
import { Search, MapPin, Navigation, Map, List, Mic, HelpCircle, Activity, ShieldCheck, Heart, User, PlusCircle } from 'lucide-react';

export default function ParkerDashboard({ currentUser, preFilledSearch, clearPreFill }) {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(preFilledSearch || '');
  const [isLocating, setIsLocating] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'map' or 'both'
  const [selectedParking, setSelectedParking] = useState(null);
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('smartpark-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Smart Amenities Filters
  const [filters, setFilters] = useState({
    vehicleType: 'All',
    maxPrice: '',
    availableOnly: false,
    covered: false,
    cctv: false,
    ev: false,
    valet: false,
    accessible: false
  });

  // Map simulation states
  const [mapZoom, setMapZoom] = useState(13);
  const [trafficLayer, setTrafficLayer] = useState(false);
  const [streetViewSim, setStreetViewSim] = useState(false);
  const [focusedParkingId, setFocusedParkingId] = useState(null);

  // Voice Search simulation states
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    fetchParkings();
    if (preFilledSearch) {
      setSearchQuery(preFilledSearch);
      clearPreFill();
    }
  }, []);

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

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('smartpark-favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const [preSelectedVehicle, setPreSelectedVehicle] = useState('Car');

  const handleStartBooking = (parking, vehicleType = 'Car') => {
    setSelectedParking(parking);
    setPreSelectedVehicle(vehicleType);
    setBookingDrawerOpen(true);
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

  // Voice search simulation
  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setSearchQuery('Sector 62');
      setIsListening(false);
      alert("🎙️ Voice identified coordinates: 'Sector 62'");
    }, 1500);
  };

  // Mock Map coordinates map key
  const mockCoordinates = {
    'Sector 62 Garage': { x: 120, y: 150 },
    'City Mall Valet': { x: 280, y: 80 },
    'Metro Station Lot': { x: 380, y: 220 },
    'Sector 21 Cover': { x: 190, y: 270 },
    'Basement B4 Outlet': { x: 420, y: 110 }
  };

  // Filtering logic
  const filteredData = parkings.filter(p => {
    if (searchQuery && !(
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )) return false;

    if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;

    // Filter by type
    if (filters.vehicleType !== 'All') {
      const slot = p.slots?.find(s => s.type === filters.vehicleType);
      if (!slot) return false;
      if (filters.availableOnly && slot.available <= 0) return false;
    } else if (filters.availableOnly) {
      if (!p.slots?.some(s => s.available > 0)) return false;
    }

    // Filter by amenities mocks (simulated based on title/price tags)
    if (filters.covered && !p.title?.toLowerCase().includes('cover') && !p.title?.toLowerCase().includes('basement')) return false;
    if (filters.cctv && p.price < 35) return false;
    if (filters.ev && !p.title?.toLowerCase().includes('outlet') && !p.title?.toLowerCase().includes('ev')) return false;
    if (filters.valet && !p.title?.toLowerCase().includes('valet')) return false;

    return true;
  });

  return (
    <div style={{ width: '100%' }}>
      {/* Top Banner Greetings & Balance */}
      <div className="flex-between pb-4 mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: '800' }}>
            Good Morning, {currentUser?.name?.split(' ')[0] || 'Shivam'} 👋
          </h2>
          <p className="text-muted text-sm">Find secure slot coordinates or track active vehicle passes.</p>
        </div>

        {/* Quick Balance indicator */}
        <div className="glass-card flex-between gap-4" style={{ padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ textAlign: 'left' }}>
            <span className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Wallet Balance</span>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--primary)' }}>₹{currentUser?.wallet || 450}</div>
          </div>
          <div style={{ width: '3px', height: '24px', background: 'var(--border)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--secondary)', cursor: 'pointer' }} onClick={() => alert("Simulated: Wallet reload drawer opened. Navigate to Profile page to add cash.")}>
            + Top Up
          </span>
        </div>
      </div>

      {/* Hero Interactive Search Toolbar */}
      <div className="glass-card mb-8" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        {/* Search bar container */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.6rem', border: '1px solid var(--border)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-solid)', minWidth: '240px' }}>
          <Search size={18} className="text-muted" />
          <input
            type="text"
            className="search-input"
            placeholder="Search sector coordinates or parking name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', padding: 0 }}
          />
          {searchQuery && (
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        {/* Voice Search & Locate */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn btn-outline ${isListening ? 'bg-red-500/10 text-red-500' : ''}`}
            onClick={handleVoiceSearch}
            title="Voice Search"
            style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}
          >
            <Mic size={16} className={isListening ? "animate-pulse" : ""} />
          </button>

          <button
            className={`btn btn-outline ${isLocating ? 'locating' : ''}`}
            onClick={handleUseLocation}
            disabled={isLocating}
            style={{ padding: '0.75rem 1.2rem', borderRadius: 'var(--radius-md)', gap: '0.4rem' }}
          >
            <Navigation size={14} /> {isLocating ? 'Locating...' : 'Near Me'}
          </button>
        </div>

        {/* Tabs for Map / List splits */}
        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-full border border-white/10" style={{ display: 'flex', gap: '0.2rem' }}>
          <button 
            className={`btn btn-sm ${activeTab === 'list' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('list')}
            style={{ padding: '0.4rem 1rem', borderRadius: '999px' }}
          >
            <List size={12} /> List View
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'map' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('map')}
            style={{ padding: '0.4rem 1rem', borderRadius: '999px' }}
          >
            <Map size={12} /> Map View
          </button>
        </div>
      </div>

      {/* Main split display */}
      <div className="dashboard-grid">
        
        {/* Left side: Parking Cards listing */}
        {(activeTab === 'list' || activeTab === 'both') && (
          <div className="col-8 flex flex-col gap-6" style={{ gridColumn: activeTab === 'list' ? 'span 12' : 'span 7' }}>
            {/* Horizontal Sub-Filter Bar */}
            <FilterBar filters={filters} setFilters={setFilters} />

            <div style={{ marginTop: '0.5rem' }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="skeleton" style={{ height: '140px', width: '100%' }} />
                  <div className="skeleton" style={{ height: '140px', width: '100%' }} />
                </div>
              ) : filteredData.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
                  <h3>No coordinate slots match filters</h3>
                  <p className="text-muted text-xs">Try adjusting your range parameters or clear search input.</p>
                  <button className="btn btn-secondary btn-sm mt-4" onClick={() => { setSearchQuery(''); setFilters({ vehicleType: 'All', maxPrice: '', availableOnly: false, covered: false, cctv: false, ev: false, valet: false, accessible: false }); }}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-between mb-4">
                    <span className="text-xs font-mono text-muted uppercase tracking-wider">{filteredData.length} spaces logged</span>
                  </div>
                  
                  <div className="cards-grid" style={{ gridTemplateColumns: activeTab === 'list' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr' }}>
                    {filteredData.map(p => (
                      <div 
                        key={p._id}
                        onMouseEnter={() => setFocusedParkingId(p._id)}
                        onMouseLeave={() => setFocusedParkingId(null)}
                        style={{
                          transform: focusedParkingId === p._id ? 'scale(1.01)' : 'scale(1)',
                          transition: 'transform 0.2s'
                        }}
                      >
                        <ParkingCard
                          parking={p}
                          isOwner={false}
                          onBook={handleStartBooking}
                          onRate={handleRate}
                          isFav={favorites.includes(p._id)}
                          onFavToggle={() => toggleFavorite(p._id)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Right side: Simulated interactive vector map (SVG) */}
        {(activeTab === 'map' || activeTab === 'both') && (
          <div className="col-4" style={{ gridColumn: activeTab === 'map' ? 'span 12' : 'span 5' }}>
            <div className="glass-card" style={{ height: '100%', minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
              
              {/* Map actions bar */}
              <div className="flex-between mb-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} className="text-muted" />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Tectonic Grid Map</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <label className="flex items-center gap-1 cursor-pointer" style={{ fontSize: '0.7rem', fontWeight: '600' }}>
                    <input 
                      type="checkbox" 
                      checked={trafficLayer}
                      onChange={(e) => setTrafficLayer(e.target.checked)}
                      style={{ width: 'auto', cursor: 'pointer' }}
                    /> Traffic
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer" style={{ fontSize: '0.7rem', fontWeight: '600' }}>
                    <input 
                      type="checkbox" 
                      checked={streetViewSim}
                      onChange={(e) => setStreetViewSim(e.target.checked)}
                      style={{ width: 'auto', cursor: 'pointer' }}
                    /> StreetView
                  </label>
                </div>
              </div>

              {/* Simulated Vector SVG Map Canvas */}
              <div className="map-canvas flex-1" style={{ position: 'relative', width: '100%', height: '400px', background: 'var(--surface-2)' }}>
                {/* Visual streets overlays */}
                <svg style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} className="stroke-white/30 dark:stroke-white/5">
                  {/* Grid lines simulating streets */}
                  <line x1="0" y1="120" x2="500" y2="120" strokeWidth={trafficLayer ? "6" : "3"} stroke={trafficLayer ? "var(--success)" : "#cbd5e1"} />
                  <line x1="0" y1="260" x2="500" y2="260" strokeWidth="3" stroke="#cbd5e1" />
                  <line x1="160" y1="0" x2="160" y2="400" strokeWidth={trafficLayer ? "6" : "3"} stroke={trafficLayer ? "var(--danger)" : "#cbd5e1"} />
                  <line x1="320" y1="0" x2="320" y2="400" strokeWidth="3" stroke="#cbd5e1" />
                  
                  {/* Street Labels */}
                  <text x="10" y="110" fill="var(--text-light)" fontSize="9" fontWeight="600">SECTOR ROAD</text>
                  <text x="170" y="20" fill="var(--text-light)" fontSize="9" fontWeight="600">MALL BYPASS</text>
                  <text x="330" y="380" fill="var(--text-light)" fontSize="9" fontWeight="600">CENTER BLVD</text>
                </svg>

                {/* Current User simulated location pin */}
                <div style={{ position: 'absolute', left: '200px', top: '180px', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5 }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--secondary)', border: '2px solid white', boxShadow: '0 0 10px var(--secondary)' }} />
                  <span style={{ fontSize: '0.6rem', fontWeight: '700', background: 'var(--secondary)', color: 'white', padding: '1px 4px', borderRadius: '4px', marginTop: '2px' }}>You</span>
                </div>

                {/* Simulated markers from filtered dataset */}
                {filteredData.map(p => {
                  const coordinates = mockCoordinates[p.title] || { x: 100 + Math.floor(Math.random() * 300), y: 50 + Math.floor(Math.random() * 250) };
                  const isHovered = focusedParkingId === p._id;
                  
                  // Availability slots coloring logic
                  const bikeSlots = p.slots?.find(s => s.type === 'Bike')?.available || 0;
                  const carSlots = p.slots?.find(s => s.type === 'Car')?.available || 0;
                  const totalAvail = bikeSlots + carSlots;
                  
                  let markerClass = 'green';
                  if (totalAvail === 0) markerClass = 'red';
                  else if (totalAvail <= 3) markerClass = 'yellow';

                  return (
                    <div
                      key={p._id}
                      className={`map-marker ${markerClass}`}
                      style={{
                        left: `${(coordinates.x / 500) * 100}%`,
                        top: `${(coordinates.y / 400) * 100}%`,
                        transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.25)' : 'scale(1)'}`,
                        zIndex: isHovered ? 12 : 6
                      }}
                      onClick={() => handleStartBooking(p)}
                      title={`${p.title} (${totalAvail} spots left)`}
                    >
                      🅿️
                    </div>
                  );
                })}
              </div>

              {/* Map controls bottom */}
              <div className="flex-between mt-4">
                <span className="text-muted text-xs">Pulsing Green markers indicate high slot availability.</span>
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setMapZoom(prev => Math.max(10, prev - 1))}>−</button>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0 0.5rem', alignSelf: 'center' }}>Zoom {mapZoom}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => setMapZoom(prev => Math.min(18, prev + 1))}>+</button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Booking Checkout drawer flow */}
      {bookingDrawerOpen && selectedParking && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
          {/* Backdrop blur */}
          <div 
            className="modal-overlay" 
            style={{ background: 'rgba(0,0,0,0.5)' }} 
            onClick={() => setBookingDrawerOpen(false)}
          />
          <BookingFlow
            parking={selectedParking}
            currentUser={currentUser}
            onClose={() => setBookingDrawerOpen(false)}
            onBookingSuccess={fetchParkings}
            initialVehicleType={preSelectedVehicle}
          />
        </div>
      )}
    </div>
  );
}

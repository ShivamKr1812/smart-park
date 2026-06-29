import React, { useState } from 'react';
import { MapPin, Phone, Heart, Star, Navigation, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

const vehicleEmoji = { Car: '🚘', Bike: '🏍️', EV: '⚡', Truck: '🚚' };

const StarRating = ({ rating, totalRatings, onRate }) => {
  const [hover, setHover] = useState(0);
  const display = rating || 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          style={{ background: 'transparent', border: 'none', padding: 0, cursor: onRate ? 'pointer' : 'default', outline: 'none' }}
          onMouseEnter={() => onRate && setHover(star)}
          onMouseLeave={() => onRate && setHover(0)}
          onClick={() => onRate && onRate(star)}
        >
          <Star 
            size={14} 
            fill={star <= (hover || display) ? '#fbbf24' : 'none'} 
            color={star <= (hover || display) ? '#fbbf24' : 'var(--text-light)'} 
          />
        </button>
      ))}
      <span style={{ fontSize: '0.8rem', fontWeight: '700', marginLeft: '0.2rem', color: 'var(--text)' }}>
        {display.toFixed(1)}
      </span>
      {totalRatings > 0 && (
        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
          ({totalRatings})
        </span>
      )}
    </div>
  );
};

export default function ParkingCard({ parking, isOwner, onEdit, onDelete, onBook, onRate, isFav, onFavToggle }) {
  const [selectedVehicle, setSelectedVehicle] = useState(parking.slots && parking.slots[0]?.type || 'Car');

  const handleOpenMap = (e) => {
    e.stopPropagation();
    window.open(`https://www.google.com/maps?q=${encodeURIComponent(parking.location)}`, '_blank');
  };

  const handleCall = (e) => {
    e.stopPropagation();
    window.location.href = `tel:${parking.phone}`;
  };

  // Extract slots details for calculations
  const activeSlot = parking.slots?.find(s => s.type === selectedVehicle);
  const totalSlots = activeSlot ? activeSlot.total : 10;
  const availableSlots = activeSlot ? activeSlot.available : 0;
  const occupancyPercentage = ((totalSlots - availableSlots) / totalSlots) * 100;

  // Amenities mock tags
  const cctvSecured = Number(parking.price) >= 35;
  const hasEv = parking.title?.toLowerCase().includes('outlet') || parking.title?.toLowerCase().includes('ev');
  const hasValet = parking.title?.toLowerCase().includes('valet');

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: '0', overflow: 'hidden', height: '100%' }}>
      
      {/* Visual Image Header */}
      <div style={{ height: '140px', background: 'var(--surface-2)', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
        {/* Procedural background geometry */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--primary-light), var(--secondary-light))', opacity: '0.7' }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: '0.1' }}>
          <pattern id="cardGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--text)" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#cardGrid)" />
        </svg>

        {/* Dynamic Badge overlay */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '0.4rem' }}>
          <span className="badge badge-success">🟢 Open</span>
          {hasEv && <span className="badge badge-warning" style={{ background: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe' }}>⚡ EV Station</span>}
        </div>

        {/* Favorite heart toggle button */}
        {!isOwner && onFavToggle && (
          <button 
            type="button"
            onClick={onFavToggle}
            style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--surface-solid)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
          >
            <Heart 
              size={16} 
              fill={isFav ? 'var(--danger)' : 'none'} 
              color={isFav ? 'var(--danger)' : 'var(--text-muted)'} 
            />
          </button>
        )}

        {/* Large Parking Indicator Icon overlay */}
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text)', fontWeight: '700', fontSize: '0.9rem' }}>
          <MapPin size={16} className="text-muted" />
          <span>{parking.location?.split(',')[0]}</span>
        </div>
        
        <div style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '0.75rem', fontWeight: '700', background: 'var(--surface-solid)', padding: '2px 8px', borderRadius: '4px' }}>
          0.8 km
        </div>
      </div>

      {/* Main card details content */}
      <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
        
        {/* Title + Price */}
        <div className="flex-between">
          <h4 style={{ fontSize: '1.05rem', fontWeight: '800', lineHeight: '1.3' }}>{parking.title}</h4>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>₹{parking.price}</span>
            <span className="text-muted" style={{ fontSize: '0.7rem' }}>/hr</span>
          </div>
        </div>

        {/* Star Rating details */}
        <StarRating
          rating={parking.rating}
          totalRatings={parking.totalRatings}
          onRate={onRate ? (val) => onRate(parking._id, val) : null}
        />

        {/* Address and details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem' }}>
          <div className="flex-between cursor-pointer" onClick={handleOpenMap} style={{ color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={13} /> {parking.location}
            </span>
          </div>
          {parking.phone && (
            <div className="flex-between cursor-pointer" onClick={handleCall} style={{ color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={13} /> {parking.phone}
              </span>
            </div>
          )}
        </div>

        {/* Amenities badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', margin: '0.2rem 0' }}>
          {cctvSecured && <span style={{ fontSize: '0.65rem', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>📹 CCTV</span>}
          {hasValet && <span style={{ fontSize: '0.65rem', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>🤵 Valet</span>}
          <span style={{ fontSize: '0.65rem', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>♿ Accessible</span>
        </div>

        {/* Slots selection pill badges */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.2rem 0' }}>
          {parking.slots?.map(slot => {
            const available = slot.available > 0;
            const isSelected = selectedVehicle === slot.type;
            return (
              <button
                key={slot.type}
                type="button"
                disabled={isOwner || !available}
                onClick={() => setSelectedVehicle(slot.type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                  background: isSelected ? 'var(--primary-light)' : 'transparent',
                  color: available ? 'var(--text)' : 'var(--text-light)',
                  cursor: isOwner || !available ? 'default' : 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}
              >
                <span>{vehicleEmoji[slot.type] || '🅿️'}</span>
                <span>{slot.type}</span>
                <span style={{ color: available ? 'var(--primary)' : 'var(--danger)' }}>
                  {slot.available}/{slot.total}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Slot availability progress bar */}
        <div style={{ marginTop: '0.2rem' }}>
          <div className="flex-between text-muted" style={{ fontSize: '0.65rem', marginBottom: '0.2rem' }}>
            <span>Slot Occupancy Ratio</span>
            <strong>{Math.round(occupancyPercentage)}% Filled</strong>
          </div>
          <div style={{ height: '5px', background: 'var(--surface-3)', borderRadius: '99px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${occupancyPercentage}%`, 
                background: occupancyPercentage > 85 ? 'var(--danger)' : occupancyPercentage > 60 ? 'var(--warning)' : 'var(--success)', 
                transition: 'width 0.3s ease' 
              }} 
            />
          </div>
        </div>

        {/* Actions Button Grid */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.8rem', marginTop: '0.4rem' }}>
          {isOwner ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => onEdit(parking)}>✏️ Edit</button>
              <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => onDelete(parking._id)}>🗑️ Delete</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline" onClick={handleOpenMap} title="Get Directions" style={{ padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)' }}>
                <Navigation size={15} />
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.6rem' }}
                onClick={() => onBook(parking)}
              >
                Book Space
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';

const LocationIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const vehicleEmoji = { Car: '🚗', Bike: '🏍️', Truck: '🚛' };

const StarRating = ({ rating, totalRatings, onRate }) => {
  const [hover, setHover] = useState(0);
  const display = rating || 0;
  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className="star-btn"
          style={{ color: star <= (hover || display) ? '#f59e0b' : 'var(--border)' }}
          onMouseEnter={() => onRate && setHover(star)}
          onMouseLeave={() => onRate && setHover(0)}
          onClick={() => onRate && onRate(star)}
        >
          {star <= (hover || display) ? '★' : '☆'}
        </button>
      ))}
      <span className="rating-text">{display.toFixed(1)}</span>
      {totalRatings > 0 && <span className="rating-count">({totalRatings})</span>}
    </div>
  );
};

export default function ParkingCard({ parking, isOwner, onEdit, onDelete, onBook, onRate }) {
  const [selectedVehicle, setSelectedVehicle] = useState(parking.slots[0]?.type || '');

  const handleOpenMap = () =>
    window.open(`https://www.google.com/maps?q=${encodeURIComponent(parking.location)}`, '_blank');

  const handleCall = () => { window.location.href = `tel:${parking.phone}`; };

  return (
    <div className="parking-card">
      {/* Compact colorful header */}
      <div className="card-map-header">
        <div className="card-map-pin">📍</div>
        <div className="card-map-label">{parking.location?.split(',')[0]}</div>
      </div>

      <div className="card-content">
        {/* Title + Price row */}
        <div className="card-header">
          <div className="card-title-block">
            <div className="card-title">{parking.title}</div>
            <StarRating
              rating={parking.rating}
              totalRatings={parking.totalRatings}
              onRate={onRate ? (val) => onRate(parking._id, val) : null}
            />
          </div>
          <div className="card-price">
            ₹{parking.price}<span className="price-unit">/hr</span>
          </div>
        </div>

        {/* Location + Phone */}
        <div className="card-details">
          <button className="card-detail-btn" onClick={handleOpenMap} title="Open in Maps">
            <span className="detail-icon"><LocationIcon /></span>
            <span className="detail-text">{parking.location}</span>
          </button>
          {parking.phone && (
            <button className="card-detail-btn" onClick={handleCall} title="Call Owner">
              <span className="detail-icon"><PhoneIcon /></span>
              <span className="detail-text">{parking.phone}</span>
            </button>
          )}
        </div>

        {/* Slot badges */}
        <div className="slots-container">
          {parking.slots.map(slot => {
            const available = slot.available > 0;
            const isSelected = selectedVehicle === slot.type;
            return (
              <div
                key={slot.type}
                className={`slot-badge ${available ? 'slot-green' : 'slot-red'} ${isSelected ? 'slot-selected' : ''}`}
                onClick={() => !isOwner && available && setSelectedVehicle(slot.type)}
                style={{ cursor: !isOwner && available ? 'pointer' : 'default' }}
              >
                <span className="slot-emoji">{vehicleEmoji[slot.type]}</span>
                <span className="slot-type">{slot.type}</span>
                <span className="slot-count">{slot.available}/{slot.total}</span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        {isOwner ? (
          <div className="card-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => onEdit(parking)}>✏️ Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(parking._id)}>🗑️ Delete</button>
          </div>
        ) : (
          <div className="card-actions-grid">
            <button className="btn-icon-action" onClick={handleCall} title="Call">
              <PhoneIcon />
            </button>
            <button className="btn-icon-action" onClick={handleOpenMap} title="Map">
              <LocationIcon />
            </button>
            <button
              className="btn btn-primary btn-book"
              disabled={!selectedVehicle}
              style={{ opacity: selectedVehicle ? 1 : 0.55 }}
              onClick={() => onBook(parking._id, selectedVehicle)}
            >
              Park Here
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

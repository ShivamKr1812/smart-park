import React, { useState } from 'react';
import { Calendar, Clock, CreditCard, Ticket, CheckCircle2, QrCode, Download, Share2, Sparkles, ChevronRight, AlertTriangle } from 'lucide-react';
import { api } from '../api';

export default function BookingFlow({ parking, currentUser, onClose, onBookingSuccess }) {
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [vehicleType, setVehicleType] = useState('Car');
  const [vehicleNo, setVehicleNo] = useState(
    currentUser?.vehicles && currentUser.vehicles.length > 0
      ? currentUser.vehicles[0].plate
      : 'DL-3C-AM-1234'
  );
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('11:00');
  const [duration, setDuration] = useState(2); // hours
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Wallet');
  const [paying, setPaying] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const basePrice = Number(parking.price) * duration;
  const finalPrice = Math.max(0, basePrice - discount);

  const applyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const code = coupon.toUpperCase().trim();
    if (code === 'PARK10') {
      const reduction = Math.round(basePrice * 0.1);
      setDiscount(reduction);
      setCouponSuccess('Promo Applied: 10% Discount Saved!');
    } else if (code === 'FIRST50') {
      const reduction = Math.round(basePrice * 0.5);
      setDiscount(reduction);
      setCouponSuccess('Promo Applied: 50% Explorer Saved!');
    } else {
      setCouponError('Invalid promo code. Try PARK10 or FIRST50.');
      setDiscount(0);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      // If paying by wallet, check balance
      if (paymentMethod === 'Wallet') {
        const walletBalance = Number(currentUser?.wallet || 0);
        if (walletBalance < finalPrice) {
          alert(`⚠️ Insufficient Wallet Balance. Current: ₹${walletBalance}. Price: ₹${finalPrice}. Please recharge in Profile Page or select Credit Card.`);
          setPaying(false);
          return;
        }
      }

      const res = await api.bookParking(parking._id, vehicleType, currentUser?._id);
      
      // Deduct from wallet client-side to maintain simulation sync
      if (paymentMethod === 'Wallet' && currentUser) {
        currentUser.wallet = Math.max(0, Number(currentUser.wallet) - finalPrice);
      }

      setBookingId(res.data._id || Math.floor(Math.random() * 1000000).toString());
      setStep(3);
      if (onBookingSuccess) onBookingSuccess();
    } catch (e) {
      alert("Booking failed: " + e.message);
    }
    setPaying(false);
  };

  return (
    <div className="drawer-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
      
      {/* Header */}
      <div className="flex-between pb-3 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <span className="text-xs font-mono text-[#10b981] uppercase tracking-wider">Checkout Wizard</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Book Parking</h3>
        </div>
        <button 
          onClick={onClose}
          style={{ background: 'var(--surface-2)', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          ✕
        </button>
      </div>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1 }}>
          {/* Parking summary card */}
          <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-hover)/10' }}>
            <h4 style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>{parking.title}</h4>
            <p className="text-muted text-xs mt-0.5">{parking.location}</p>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', marginTop: '0.4rem', display: 'block' }}>
              ₹{parking.price}/hr • Hourly Tariff
            </span>
          </div>

          {/* Vehicle Select */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted">Active Vehicle Profile</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                value={vehicleType} 
                onChange={e => setVehicleType(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="Car">🚘 Car / Hatchback / SUV</option>
                <option value="Bike">🏍️ Motorcycle / Scooter</option>
                <option value="EV">⚡ Electric Vehicle</option>
                <option value="Truck">🚚 Commercial Truck</option>
              </select>
            </div>
            
            <input 
              type="text" 
              placeholder="License Number Plate (e.g. DL-3C-AM-1234)" 
              value={vehicleNo}
              onChange={e => setVehicleNo(e.target.value)}
              style={{ marginTop: '0.5rem' }}
            />
          </div>

          {/* Date / Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted flex items-center gap-1">
                <Calendar size={12} /> Select Date
              </label>
              <input 
                type="date" 
                value={bookingDate} 
                onChange={e => setBookingDate(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted flex items-center gap-1">
                <Clock size={12} /> Entry Time
              </label>
              <input 
                type="time" 
                value={bookingTime} 
                onChange={e => setBookingTime(e.target.value)} 
              />
            </div>
          </div>

          {/* Duration Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex-between">
              <label className="text-xs font-semibold text-muted">Parking Duration</label>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>
                {duration} Hour{duration !== 1 ? 's' : ''}
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="12" 
              value={duration} 
              onChange={e => setDuration(Number(e.target.value))}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer', padding: 0 }}
            />
          </div>

          <button className="btn btn-primary w-full mt-4" style={{ gap: '0.4rem' }} onClick={() => setStep(2)}>
            Proceed to Payment <ChevronRight size={16} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1 }}>
          {/* Coupon inputs */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted flex items-center gap-1">
              <Ticket size={12} /> Apply Promo Code
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Enter PARK10 or FIRST50" 
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-outline btn-sm" onClick={applyCoupon}>
                Apply
              </button>
            </div>
            {couponError && <span style={{ color: 'var(--danger)', fontSize: '0.7rem', fontWeight: '500' }}>{couponError}</span>}
            {couponSuccess && <span style={{ color: 'var(--success)', fontSize: '0.7rem', fontWeight: '600' }}>{couponSuccess}</span>}
          </div>

          {/* Payment Method Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted flex items-center gap-1">
              <CreditCard size={12} /> Payment Channel
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { id: 'Wallet', label: `Digital Wallet (Bal: ₹${currentUser?.wallet || 0})`, info: 'Instant check' },
                { id: 'UPI', label: 'UPI Instant (GPay / PhonePe / Paytm)', info: 'Safe routing' },
                { id: 'Card', label: 'Credit / Debit Card', info: 'Visa / MasterCard' }
              ].map(method => (
                <label 
                  key={method.id} 
                  style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'between',
                    padding: '0.85rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid',
                    borderColor: paymentMethod === method.id ? 'var(--primary)' : 'var(--border)',
                    background: paymentMethod === method.id ? 'var(--primary-light)' : 'var(--surface-solid)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <input 
                      type="radio" 
                      name="payMethod"
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      style={{ width: 'auto', accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text)' }}>{method.label}</span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.7rem' }}>{method.info}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="glass-card" style={{ padding: '1rem', background: 'var(--surface-2)', marginTop: '0.5rem' }}>
            <div className="flex-between text-xs text-muted">
              <span>Standard Price ({duration} hrs)</span>
              <span>₹{basePrice}</span>
            </div>
            {discount > 0 && (
              <div className="flex-between text-xs text-[#10b981] mt-1">
                <span>Promo Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex-between text-sm font-semibold mt-2 pt-2" style={{ borderTop: '1px solid var(--border)', color: 'var(--text)' }}>
              <span>Total Payable</span>
              <span>₹{finalPrice}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.5rem', marginTop: '1rem' }}>
            <button className="btn btn-outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handlePay}
              disabled={paying}
            >
              {paying ? 'Paying...' : `Confirm & Pay ₹${finalPrice}`}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, padding: '1rem 0' }}>
          <div className="checkmark-circle animate-scale-in">
            ✓
          </div>
          
          <span className="badge badge-success mb-2" style={{ gap: '0.2rem' }}>
            <Sparkles size={11} /> Booking Confirmed
          </span>

          <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Slot Reserved!</h3>
          <p className="text-muted text-xs mt-1 max-w-[280px]">
             Tectonic grid scanner loaded. Scan this QR code at entry barriers for direct entry checks.
          </p>

          {/* SVG Simulated QR code */}
          <div 
            className="glass-card" 
            style={{ 
              margin: '1.5rem 0', 
              padding: '1rem', 
              background: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px solid var(--primary-light)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <svg style={{ width: '130px', height: '130px', fill: '#111827' }} viewBox="0 0 100 100">
              {/* Outer square outline borders */}
              <rect x="5" y="5" width="25" height="25" stroke="#111827" strokeWidth="6" fill="none" />
              <rect x="70" y="5" width="25" height="25" stroke="#111827" strokeWidth="6" fill="none" />
              <rect x="5" y="70" width="25" height="25" stroke="#111827" strokeWidth="6" fill="none" />
              {/* Inner details pixels */}
              <rect x="12" y="12" width="11" height="11" />
              <rect x="77" y="12" width="11" height="11" />
              <rect x="12" y="77" width="11" height="11" />
              {/* Random QR code pixels block */}
              <rect x="40" y="5" width="6" height="15" />
              <rect x="50" y="15" width="10" height="6" />
              <rect x="40" y="30" width="15" height="15" />
              <rect x="5" y="45" width="20" height="8" />
              <rect x="75" y="40" width="12" height="18" />
              <rect x="65" y="65" width="18" height="6" />
              <rect x="40" y="60" width="6" height="25" />
              <rect x="55" y="75" width="25" height="10" />
            </svg>
          </div>

          {/* Receipt Info */}
          <div style={{ width: '100%', borderTop: '1px dashed var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem', textAlign: 'left', marginBottom: '1.5rem' }}>
            <div className="flex-between">
              <span className="text-muted">Booking Reference</span>
              <strong style={{ fontFamily: 'mono' }}>SP-{bookingId}</strong>
            </div>
            <div className="flex-between">
              <span className="text-muted">Vehicle License Plate</span>
              <strong>{vehicleNo}</strong>
            </div>
            <div className="flex-between">
              <span className="text-muted">Tectonic Sector Spot</span>
              <strong>{parking.title}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
            <button className="btn btn-outline" style={{ flex: 1, gap: '0.3rem', fontSize: '0.8rem' }} onClick={() => alert("Simulated: Digital invoice downloaded.")}>
              <Download size={14} /> Receipt
            </button>
            <button className="btn btn-outline" style={{ flex: 1, gap: '0.3rem', fontSize: '0.8rem' }} onClick={() => alert("Simulated: Booking credentials shared.")}>
              <Share2 size={14} /> Share
            </button>
          </div>

          <button className="btn btn-primary w-full mt-4" onClick={onClose}>
            Done
          </button>
        </div>
      )}

    </div>
  );
}

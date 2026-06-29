import React, { useState } from 'react';
import { ArrowRight, Search, CheckCircle, Shield, Award, Zap, HelpCircle, Users, MapPin, Phone } from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  const [searchLocation, setSearchLocation] = useState('');
  
  const faqs = [
    { q: "How do I book a parking spot?", a: "Enter your destination location on our search bar, select a preferred parking spot from the list or map, choose your duration, apply coupon, and pay securely using UPI, Card, or Wallet." },
    { q: "Can I extend my booking duration?", a: "Yes, you can extend your booking directly from your Active Bookings panel before the slot expiry time. Additional hourly fees will apply." },
    { q: "How does QR Entry and Exit work?", a: "Upon confirming a booking, a digital QR code is generated. Scan this QR code at the physical terminal gate of the parking lot to entry and exit seamlessly." },
    { q: "Can I register multiple vehicles?", a: "Certainly! You can add cars, bikes, EVs, or trucks in your profile management center and select the active vehicle during checkout." }
  ];

  const [activeFaq, setActiveFaq] = useState(0);

  return (
    <div className="landing-page-root" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Hero Section */}
      <section className="hero-section-container" style={{ padding: '6rem 2rem 4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'var(--primary-light)', filter: 'blur(80px)', opacity: '0.5', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'var(--secondary-light)', filter: 'blur(80px)', opacity: '0.5', pointerEvents: 'none' }} />
        
        <span className="badge badge-success mb-4" style={{ animation: 'fadeIn 1s' }}>
          ✨ Smart Parking Redefined
        </span>
        
        <h1 style={{ fontSize: '3rem', maxWidth: '800px', lineHeight: '1.2', marginBottom: '1.5rem', fontWeight: '800' }}>
          Find, Reserve, & Park Instantly <br/>
          <span style={{ color: 'var(--primary)' }}>Real-Time Spaces Anywhere</span>
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '2.5rem', fontWeight: '300' }}>
           peeking back the crust of cities to trace every free slot. Book secure spots with digital payment and contactless QR access.
        </p>

        {/* Hero Search Box Mocks */}
        <div className="glass-card" style={{ maxWidth: '650px', width: '100%', padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center', marginBottom: '3rem', borderRadius: '100px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.6rem', paddingLeft: '1rem', minWidth: '220px' }}>
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Where are you heading?" 
              value={searchLocation}
              onChange={e => setSearchLocation(e.target.value)}
              style={{ border: 'none', background: 'transparent', padding: '0.4rem', fontSize: '0.95rem' }}
            />
          </div>
          <button 
            className="btn btn-primary" 
            style={{ borderRadius: '100px', padding: '0.8rem 2rem' }}
            onClick={() => onGetStarted(searchLocation)}
          >
            Find Slots <ArrowRight size={16} />
          </button>
        </div>

        {/* Live counter bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
          <div className="flex-between gap-2">
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulseGlow 2s infinite' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>14,290 Spots Available Right Now</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800' }}>Explore Smart Features</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Evolving parking from search anxiety to structured logistics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifySelf: 'start', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Zap size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>Real-Time Slot Meters</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Track slot vacancies in real time. Avoid circling blocks: our live pins tell you if spots are empty, limited, or full.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifySelf: 'start', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Shield size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>Secure QR Verification</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Automatic QR code generation for entry and exit checks. Encrypted payment protocols ensure your security parameters.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifySelf: 'start', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Award size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>Premium Valet & Charging</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Filter spots for electric vehicle charging stations, handicap amenities, covered shelters, and verified valet services.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section style={{ background: 'var(--surface-solid)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '4rem 2rem' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div>
            <h4 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>99.8%</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', tracking: '0.05em' }}>Booking Success Rate</p>
          </div>
          <div>
            <h4 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--secondary)' }}>250k+</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', tracking: '0.05em' }}>Happy Commuters</p>
          </div>
          <div>
            <h4 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent)' }}>40+</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', tracking: '0.05em' }}>Urban Smart Cities</p>
          </div>
          <div>
            <h4 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text)' }}>₹1.2M+</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', tracking: '0.05em' }}>Wallet Topups Transacted</p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800' }}>Common Inquiries</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Any questions regarding spots validation? We have got you covered.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index} 
                className="glass-card" 
                style={{ padding: '1.2rem', cursor: 'pointer', borderColor: isOpen ? 'var(--primary)' : 'var(--border)' }}
                onClick={() => setActiveFaq(isOpen ? -1 : index)}
              >
                <div className="flex-between">
                  <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <HelpCircle size={16} className="text-muted" /> {faq.q}
                  </h4>
                  <span>{isOpen ? '−' : '+'}</span>
                </div>
                {isOpen && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.8rem', lineHeight: '1.6', borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Landing Footer */}
      <footer style={{ background: 'var(--surface-solid)', borderTop: '1px solid var(--border)', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'between', gap: '2rem' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ fontWeight: '800', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <svg style={{ width: '24px', height: '24px', fill: 'var(--primary)' }} viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h4c1.66 0 3 1.34 3 3s-1.34 3-3 3h-2v2zm0-4h2c.55 0 1-.45 1-1s-.45-1-1-1h-2v2z"/>
              </svg>
              SmartPark
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxW: '300px', lineHeight: '1.5' }}>
              An intelligent, contactless parking reservation platform designed to optimize urban mobility and garage administration.
            </p>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <span style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--text-light)', marginBottom: '0.4rem' }}>Resources</span>
              <span className="cursor-pointer hover:text-[#10b981]">Coverage Maps</span>
              <span className="cursor-pointer hover:text-[#10b981]">Mobile App</span>
              <span className="cursor-pointer hover:text-[#10b981]">Commercial Plans</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <span style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--text-light)', marginBottom: '0.4rem' }}>Support</span>
              <span className="cursor-pointer hover:text-[#10b981]">Help Desk</span>
              <span className="cursor-pointer hover:text-[#10b981]">API License</span>
              <span className="cursor-pointer hover:text-[#10b981]">Safety Coordinates</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-light)' }}>
          © {new Date().getFullYear()} SmartPark Systems Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';

const SUBJECTS = [
  'Booking Issue',
  'Payment Problem',
  'App Bug / Error',
  'Parking Dispute',
  'Feature Request',
  'Other',
];

const FAQ = [
  {
    q: 'How do I cancel a booking?',
    a: 'Currently bookings are confirmed instantly. Please contact support with your booking details for cancellation assistance.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Yes. SmartPark uses industry-standard encryption. No card data is stored on our servers.',
  },
  {
    q: 'Can I book for multiple vehicles?',
    a: 'Yes! Each booking is per vehicle. You can make separate bookings for each vehicle type you need.',
  },
  {
    q: 'How do I list my parking space?',
    a: 'Sign up or log in as a "Park Owner" and use the dashboard to add your space details and slot capacity.',
  },
];

export default function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // mock send
    setLoading(false);
    setSubmitted(true);
  };

  const resetForm = () => {
    setForm({ name: '', email: '', subject: '', message: '' });
    setSubmitted(false);
  };

  return (
    <div className="page-wrapper">
      <div className="support-page">

        <div className="page-header">
          <div>
            <h2 className="page-title">💬 Support</h2>
            <p className="page-subtitle">We're here to help — reach out anytime</p>
          </div>
          <a href="mailto:support@smartpark.in" className="support-email-pill">
            ✉️ support@smartpark.in
          </a>
        </div>

        <div className="support-grid">
          {/* Contact form */}
          <div className="support-form-card">
            <h3>Send a Message</h3>
            {submitted ? (
              <div className="submit-success">
                <div className="success-icon">✅</div>
                <h4>Message Sent!</h4>
                <p>We'll get back to you within 24 hours at <strong>{form.email}</strong>.</p>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }} onClick={resetForm}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="support-form">
                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    className="input-field"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    className="input-field"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <select
                    className="input-field"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select a topic...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    className="input-field support-textarea"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your issue in detail..."
                    required
                    disabled={loading}
                    rows={5}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? '📤 Sending...' : '📤 Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* FAQ accordion */}
          <div className="faq-card">
            <h3>Frequently Asked Questions</h3>
            <div className="faq-list">
              {FAQ.map((item, i) => (
                <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                  <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{item.q}</span>
                    <span className="faq-chevron">{openFaq === i ? '▲' : '▼'}</span>
                  </button>
                  {openFaq === i && (
                    <div className="faq-answer">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

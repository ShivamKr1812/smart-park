import React, { useState } from 'react';
import { Send, User, Cpu, Sparkles, HelpCircle, MessageSquare, AlertCircle } from 'lucide-react';

const SUBJECTS = [
  'Booking Issue',
  'Payment Problem',
  'App Bug / Error',
  'Parking Dispute',
  'Feature Request',
  'Other',
];

export default function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Chatbot State
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "Hello Shivam! I am your SmartPark AI Assistant. How can I assist you in routing or slot selections today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  const chips = [
    { label: "Lost QR pass ticket", reply: "If you lost your QR code, simply visit the 'Bookings' tab in your dashboard, click 'Ticket Pass' next to the active booking, and your QR code will be loaded instantly." },
    { label: "Wallet refund timing", reply: "Refunds for cancelled bookings are credited back to your SmartPark digital wallet instantly. Banking card transfers take 2-4 business days depending on the routing channel." },
    { label: "EV Charger failure", reply: "If a designated charging port is offline, park in the spot and report the outlet number via our 'Raise Ticket' form. Our technician will be notified." }
  ];

  const handleFormChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // mock send
    setLoading(false);
    setSubmitted(true);
  };

  const handleSendMessage = (textToSend) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    // Append user message
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: query }]);
    setChatInput('');
    setAiTyping(true);

    // AI answer logic matches keywords or triggers generic response
    setTimeout(() => {
      let replyText = "I have logged your request. Our support liaison will get in touch with you shortly. Alternatively, you can raise an official ticket on the left panel.";
      
      // Match chip or question patterns
      const matched = chips.find(c => query.toLowerCase().includes(c.label.toLowerCase()) || c.label.toLowerCase().includes(query.toLowerCase()));
      if (matched) {
        replyText = matched.reply;
      } else if (query.toLowerCase().includes('qr') || query.toLowerCase().includes('pass')) {
        replyText = "Your digital QR codes are stored inside the 'Bookings' panel. Simply click 'Ticket Pass' on the active slot record.";
      } else if (query.toLowerCase().includes('wallet') || query.toLowerCase().includes('money') || query.toLowerCase().includes('refund')) {
        replyText = "Wallet balances can be reloaded in the 'Profile' page. Select the 'Wallet' tab and enter your UPI or Credit Card details.";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: replyText }]);
      setAiTyping(false);
    }, 1200);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div className="flex-between pb-4 mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: '800' }}>Support Center</h2>
          <p className="text-muted text-sm font-light">Get assistance in real time or raise formal support tickets.</p>
        </div>
        <a href="mailto:support@smartpark.in" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
          ✉️ support@smartpark.in
        </a>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Official ticket raiser form */}
        <div className="col-8">
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} className="text-muted" /> Raise Support Ticket
            </h3>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div className="checkmark-circle">✓</div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Ticket Logged!</h4>
                <p className="text-muted text-xs mt-1">Our customer liaison will dispatch a resolution key to <strong>{form.email}</strong> within 24 hours.</p>
                <button className="btn btn-outline btn-sm mt-6" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                  Raise Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      placeholder="Shivam Kumar"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleFormChange}
                      placeholder="shivam@park.com"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted">Ticket Subject</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select issue category...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted">Detailed Description</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleFormChange}
                    placeholder="Provide slot number, location, and issue overview..."
                    required
                    rows={4}
                    style={{ resize: 'none' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
                  {loading ? 'Submitting Ticket...' : 'File Official Ticket'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: AI Assistant Chatbot */}
        <div className="col-4">
          <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justify: 'between' }}>
            
            {/* Header info */}
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={16} className="text-primary" />
                <strong style={{ fontSize: '0.9rem' }}>SmartPark AI Assistant</strong>
              </div>
              <p className="text-muted text-[10px] mt-0.5">Contactless automated agent replies instantly.</p>
            </div>

            {/* Conversational Screen logs */}
            <div style={{ flex: 1, minHeight: '280px', maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingRight: '0.2rem', marginBottom: '1rem' }}>
              {messages.map(m => {
                const isAi = m.sender === 'ai';
                return (
                  <div 
                    key={m.id} 
                    style={{ 
                      alignSelf: isAi ? 'start' : 'end', 
                      background: isAi ? 'var(--surface-2)' : 'var(--primary-light)', 
                      color: isAi ? 'var(--text)' : 'var(--primary)',
                      padding: '0.65rem 0.95rem',
                      borderRadius: '12px',
                      borderBottomLeftRadius: isAi ? '0' : '12px',
                      borderBottomRightRadius: isAi ? '12px' : '0',
                      maxWidth: '85%',
                      fontSize: '0.75rem',
                      lineHeight: '1.4'
                    }}
                  >
                    {m.text}
                  </div>
                );
              })}

              {aiTyping && (
                <div style={{ alignSelf: 'start', background: 'var(--surface-2)', padding: '0.65rem 0.95rem', borderRadius: '12px', borderBottomLeftRadius: 0, fontSize: '0.75rem', display: 'flex', gap: '0.2rem' }}>
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                </div>
              )}
            </div>

            {/* Quick chips buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
              <span className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Quick Queries</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {chips.map(c => (
                  <button 
                    key={c.label} 
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '3px 8px', fontSize: '0.65rem', borderRadius: '6px' }}
                    onClick={() => handleSendMessage(c.label)}
                  >
                    💡 {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Send controls */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Type query coordinates..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                style={{ flex: 1, padding: '0.5rem 0.8rem', fontSize: '0.75rem' }}
              />
              <button 
                className="btn btn-primary" 
                style={{ padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-md)' }}
                onClick={() => handleSendMessage()}
              >
                <Send size={14} />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

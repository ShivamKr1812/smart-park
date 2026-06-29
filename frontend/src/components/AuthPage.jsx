import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, X, ShieldCheck } from 'lucide-react';

export default function AuthPage({ initialMode = 'login', onLoginSuccess, onClose }) {
  const [isLoginView, setIsLoginView] = useState(initialMode === 'login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // OTP Mocks
  const [otpSent, setOtpSent] = useState(false);
  const [otpVal, setOtpVal] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'parker' // 'parker' | 'owner' | 'admin'
  });

  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const setRole = (role) => {
    setAuthForm({ ...authForm, role });
  };

  // Password strength checker helper
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: '#e2e8f0' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 0:
      case 1:
        return { score, label: 'Weak', color: 'var(--danger)' };
      case 2:
      case 3:
        return { score, label: 'Moderate', color: 'var(--warning)' };
      case 4:
      case 5:
      default:
        return { score, label: 'Strong', color: 'var(--success)' };
    }
  };

  const strength = getPasswordStrength(authForm.password);

  const handleSendOtp = () => {
    if (!authForm.phone) {
      setError('Please provide phone coordinates before verifying OTP');
      return;
    }
    setOtpSent(true);
    setError('');
    alert("🔐 Verification code sent to +91 " + authForm.phone + " (Code is 1234)");
  };

  const handleVerifyOtp = () => {
    if (otpVal === '1234') {
      setOtpVerified(true);
      setOtpSent(false);
      setError('');
    } else {
      setError('Invalid OTP code. Enter 1234 to verify.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check validation constraints
    if (!authForm.email || !authForm.password || (!isLoginView && (!authForm.name || !authForm.phone))) {
      setError('Please fill all required terminal fields');
      return;
    }

    if (!isLoginView && !otpVerified) {
      setError('Please authenticate phone coordinates using OTP (Code: 1234)');
      return;
    }

    setLoading(true);
    try {
      const { api } = await import('../api');
      let res;
      if (isLoginView) {
        res = await api.login({ email: authForm.email, password: authForm.password, role: authForm.role });
      } else {
        res = await api.signup(authForm);
      }
      onLoginSuccess(res.data);
    } catch (err) {
      setError(err.message || 'Authentication terminal failed');
    }
    setLoading(false);
  };

  // Google Login Simulator
  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      // Create a mock user depending on selected role
      const mockName = authForm.role === 'admin' ? 'Admin Shivam' : authForm.role === 'owner' ? 'Owner Shivam' : 'Parker Shivam';
      const mockEmail = authForm.role + '@smartpark.com';
      onLoginSuccess({
        _id: 'google-oauth-id-' + Math.floor(Math.random() * 1000),
        name: mockName,
        email: mockEmail,
        role: authForm.role,
        phone: '9999999999'
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Modal Close Icon */}
      <button 
        onClick={onClose} 
        style={{ position: 'absolute', right: '-10px', top: '-10px', background: 'var(--surface-2)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}
      >
        <X size={16} />
      </button>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <span className="badge badge-success mb-2" style={{ gap: '0.2rem' }}>
          <Sparkles size={11} /> SmartPark Secure Gateway
        </span>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
          {isLoginView ? 'Welcome Back' : 'Create Profile'}
        </h2>
        <p className="text-muted text-xs mt-1">
          {isLoginView ? 'Sign in to access your coordinate grid' : 'Set up a Parker, Owner or Admin credentials'}
        </p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', marginBottom: '1rem', fontWeight: '500' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Role Selection Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
        {['parker', 'owner', 'admin'].map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setRole(role)}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid',
              borderColor: authForm.role === role ? 'var(--primary)' : 'var(--border)',
              background: authForm.role === role ? 'var(--primary-light)' : 'transparent',
              color: authForm.role === role ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {role}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {/* Sign Up Fields */}
        {!isLoginView && (
          <>
            <div style={{ position: 'relative' }}>
              <User className="text-muted" size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                name="name"
                required
                placeholder="Enter Full Name"
                value={authForm.name}
                onChange={handleAuthChange}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Phone className="text-muted" size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="Phone Number"
                  value={authForm.phone}
                  onChange={handleAuthChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              
              {!otpVerified && (
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm" 
                  onClick={handleSendOtp}
                  style={{ borderRadius: 'var(--radius-md)', padding: '0.75rem' }}
                >
                  Verify
                </button>
              )}
            </div>

            {/* OTP Verification sub-flow */}
            {otpSent && (
              <div className="glass-card" style={{ display: 'flex', gap: '0.5rem', padding: '0.8rem', background: 'var(--surface-2)', borderStyle: 'dashed' }}>
                <input
                  type="text"
                  placeholder="Enter Code (1234)"
                  value={otpVal}
                  onChange={(e) => setOtpVal(e.target.value)}
                  style={{ flex: 1, padding: '0.5rem 0.8rem' }}
                />
                <button type="button" className="btn btn-primary btn-sm" onClick={handleVerifyOtp}>
                  Submit
                </button>
              </div>
            )}

            {otpVerified && (
              <div style={{ color: 'var(--success)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600' }}>
                <ShieldCheck size={14} /> Phone Authentication Verified
              </div>
            )}
          </>
        )}

        {/* Email Field */}
        <div style={{ position: 'relative' }}>
          <Mail className="text-muted" size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="email"
            name="email"
            required
            placeholder="explorer@deep-time.org"
            value={authForm.email}
            onChange={handleAuthChange}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Password Field */}
        <div style={{ position: 'relative' }}>
          <Lock className="text-muted" size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            placeholder="Security Password"
            value={authForm.password}
            onChange={handleAuthChange}
            style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {!isLoginView && authForm.password && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'between', fontSize: '0.65rem', marginBottom: '0.2rem', color: 'var(--text-muted)' }}>
              <span>Password Security Strength:</span>
              <strong style={{ color: strength.color }}>{strength.label}</strong>
            </div>
            <div style={{ height: '4px', background: 'var(--surface-3)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(strength.score / 5) * 100}%`, background: strength.color, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        {/* Remember me & Forgot Password */}
        {isLoginView && (
          <div className="flex-between" style={{ fontSize: '0.75rem' }}>
            <label className="flex-between gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 'auto', cursor: 'pointer' }}
              />
              <span className="text-muted">Remember terminal</span>
            </label>
            <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }} onClick={() => alert("Simulated: Forgot Password instructions dispatched to " + (authForm.email || "registered email"))}>
              Forgot Password?
            </span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-full mt-2"
          disabled={loading}
        >
          {loading ? 'Authenticating...' : isLoginView ? 'Access Account' : 'Register Profile'}
        </button>
      </form>

      {/* Social Oauth Simulator divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.2rem 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: '500', textTransform: 'uppercase' }}>Or Continue With</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <button className="btn btn-outline w-full" onClick={handleGoogleLogin} style={{ gap: '0.6rem' }}>
        <span>🌐</span> Sign In with Google
      </button>

      {/* View Switch Link */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem' }}>
        <span className="text-muted">
          {isLoginView ? 'New to SmartPark?' : 'Already have a profile?'}
        </span>{' '}
        <button
          onClick={() => setIsLoginView(!isLoginView)}
          style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}
        >
          {isLoginView ? 'Create Account' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}

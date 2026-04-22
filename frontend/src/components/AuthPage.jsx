import React, { useState } from 'react';

export default function AuthPage({ onLoginSuccess }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'parker'
  });

  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const setRole = (role) => {
    setAuthForm({ ...authForm, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!authForm.email || !authForm.password || (!isLoginView && (!authForm.name || !authForm.phone))) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const { api } = await import('../api');
      let res;
      if (isLoginView) {
        res = await api.login({ email: authForm.email, password: authForm.password });
      } else {
        res = await api.signup(authForm);
      }
      onLoginSuccess(res.data);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-sidebar">
          <h1>🚗 Smart Parking</h1>
          <p>
            The easiest way to find and manage secure parking spaces. Join today and make your parking experience seamless!
          </p>
          <div className="auth-graphic"></div>
        </div>
        <div className="auth-card-content">
          <h2>{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="auth-subtitle">{isLoginView ? 'Sign in to access your dashboard' : 'Join as a Parker or Park Owner'}</p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="role-cards-container">
               <div 
                  className={`role-card ${authForm.role === 'parker' ? 'active-role' : ''}`}
                  onClick={() => setRole('parker')}
               >
                  <div className="role-icon">🔍</div>
                  <h4>Parker</h4>
                  <p>Find & book parking spaces</p>
               </div>
               <div 
                  className={`role-card ${authForm.role === 'owner' ? 'active-role' : ''}`}
                  onClick={() => setRole('owner')}
               >
                  <div className="role-icon">🅿️</div>
                  <h4>Park Owner</h4>
                  <p>List & manage your slots</p>
               </div>
            </div>

            {!isLoginView && (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    className="input-field"
                    name="name"
                    type="text"
                    value={authForm.name}
                    onChange={handleAuthChange}
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    className="input-field"
                    name="phone"
                    type="tel"
                    value={authForm.phone}
                    onChange={handleAuthChange}
                    placeholder="+91 98765 43210"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                className="input-field"
                name="email"
                type="email"
                value={authForm.email}
                onChange={handleAuthChange}
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                className="input-field"
                name="password"
                type="password"
                value={authForm.password}
                onChange={handleAuthChange}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-auth" disabled={loading}>
              {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="auth-toggle">
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setIsLoginView(!isLoginView); setError(''); }}>
              {isLoginView ? 'Sign up' : 'Log in'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

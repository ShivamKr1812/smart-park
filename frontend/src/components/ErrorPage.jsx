import React from 'react';
import { AlertCircle, Home, RefreshCcw } from 'lucide-react';

export function NotFound({ onGoHome }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '2rem' }}>
        ⚠️
      </div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>404 - Grid Lost</h1>
      <p className="text-muted" style={{ maxWidth: '420px', marginBottom: '2rem', fontSize: '0.95rem' }}>
        The coordinates you requested do not map to our registered telemetry parking slots.
      </p>
      <button className="btn btn-primary" onClick={onGoHome} style={{ gap: '0.5rem' }}>
        <Home size={16} /> Return to Dashboard
      </button>
    </div>
  );
}

export function ServerError({ onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--danger-bg)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <AlertCircle size={40} />
      </div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>500 - Telemetry Error</h1>
      <p className="text-muted" style={{ maxWidth: '420px', marginBottom: '2rem', fontSize: '0.95rem' }}>
        We encountered an internal database connection timeout. Try refreshing or contact help liaison.
      </p>
      <button className="btn btn-outline" onClick={onRetry} style={{ gap: '0.5rem' }}>
        <RefreshCcw size={16} /> Retry Telemetry
      </button>
    </div>
  );
}

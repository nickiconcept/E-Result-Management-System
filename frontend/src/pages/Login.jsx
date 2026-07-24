import React, { useState } from 'react';
import api from '../utils/api';

export default function Login({ onLoginSuccess, onBack }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await api.login(identifier, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-secondary))',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '40px',
        backgroundColor: 'var(--bg-surface)'
      }}>
        {onBack && (
          <button onClick={onBack} className="btn btn-secondary" style={{
            padding: '6px 12px',
            fontSize: '0.8rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            border: '1px solid var(--border-color)'
          }}>
            ← Back to Homepage
          </button>
        )}
        {/* School Logo/Branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '10px' }}>JMA</div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)' }}>Jere Model Academy</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            ONLINE SCHOOL PORTAL
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: '600',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">Username / Admission Number</label>
            <input
              type="text"
              id="identifier"
              className="form-control"
              placeholder="e.g. admin or JMA/2026/0001"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              required
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
              *Students: enter your JMA admission number.
            </small>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            Opposite Jabal-Annur Mosque, Kaduna State.
          </p>
        </div>
      </div>
    </div>
  );
}

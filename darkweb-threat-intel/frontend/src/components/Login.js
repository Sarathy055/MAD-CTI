import React, { useState } from 'react';

export default function Login({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    // Temporary local-only auth: accepts any credentials and returns a mock token.
    // Replace with real API call when authentication backend is available.
    if (!email) return setError('Please enter an email');

    try {
      const user = { email, name: email.split('@')[0] };
      const token = 'dev-token-' + Math.random().toString(36).slice(2, 10);
      onAuth({ user, token });
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '4rem auto', padding: '2rem', borderRadius: 8, boxShadow: '0 6px 18px rgba(15,23,42,0.06)' }}>
      <h2 style={{ marginBottom: '1rem', color: '#0f172a' }}>Sign in</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#475569' }}>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#475569' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
        </div>

        {error && <div style={{ color: '#ef4444', marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="submit" style={{ padding: '0.5rem 0.75rem', borderRadius: 6, background: '#0ea5a4', color: 'white', border: 'none' }}>Sign in</button>
          <button type="button" onClick={() => { setEmail('demo@local'); setPassword('demo'); }} style={{ padding: '0.45rem 0.7rem', borderRadius: 6, border: '1px solid #cbd5e1', background: 'white' }}>Fill demo</button>
        </div>
      </form>
    </div>
  );
}

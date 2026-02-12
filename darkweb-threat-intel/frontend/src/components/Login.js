import React, { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function Login({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) return setError('Please enter email and password');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Login failed');
      onAuth({ user: data.user, token: data.token });
    } catch (err) {
      setError('Connection failed. Please ensure the server is running.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)' }}>
      <div style={{ maxWidth: 440, width: '100%', margin: '2rem', padding: '2.5rem', borderRadius: 16, background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)', border: '1px solid rgba(139, 92, 246, 0.2)' }} className="fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #c084fc)', marginBottom: '1rem', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)' }}>
            <Shield style={{ width: 32, height: 32, color: 'white' }} />
          </div>
          <h2 style={{ marginBottom: '0.5rem', color: 'white', fontSize: '1.75rem', fontWeight: 'bold' }}>Administrator Login</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 0 }}>Dark Web Threat Intelligence Platform</p>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 14, marginBottom: 8, color: '#cbd5e1', fontWeight: 500 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid rgba(139, 92, 246, 0.3)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', fontSize: 14, transition: 'all 0.3s ease' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: 14, marginBottom: 8, color: '#cbd5e1', fontWeight: 500 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ width: '100%', padding: '0.75rem 1rem', paddingRight: '3rem', borderRadius: 8, border: '1px solid rgba(139, 92, 246, 0.3)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', fontSize: 14, transition: 'all 0.3s ease' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#c084fc'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', marginBottom: '1rem', fontSize: 14 }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            style={{ width: '100%', padding: '0.875rem', borderRadius: 8, background: 'linear-gradient(135deg, #8b5cf6, #c084fc)', color: 'white', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)' }}
          >
            Sign In
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 8, background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, textAlign: 'center' }}>
            🔒 Access restricted to authorized administrators only
          </p>
        </div>
      </div>
    </div>
  );
}

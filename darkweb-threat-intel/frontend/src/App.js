import React, { useState, useEffect } from 'react';
import './App.css';
import ThreatDashboard from './components/ThreatDashboard';
import Login from './components/Login';

function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token ? { token, user: user ? JSON.parse(user) : null } : null;
  });

  useEffect(() => {
    if (auth && auth.token) localStorage.setItem('token', auth.token);
    if (auth && auth.user) localStorage.setItem('user', JSON.stringify(auth.user));
  }, [auth]);

  const handleAuth = ({ user, token }) => setAuth({ user, token });
  const handleSignOut = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setAuth(null); };

  return (
    <div className="App">
      {!auth ? (
        <Login onAuth={handleAuth} />
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem' }}>
            <div style={{ color: '#94a3b8', marginRight: '1rem' }}>{auth.user?.name || auth.user?.email}</div>
            <button onClick={handleSignOut} style={{ padding: '0.5rem 0.75rem', borderRadius: 6, background: '#ef4444', color: 'white', border: 'none' }}>Sign out</button>
          </div>
          <ThreatDashboard auth={auth} />
        </div>
      )}
    </div>
  );
}

export default App;
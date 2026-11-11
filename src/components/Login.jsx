import React, { useState } from 'react';

function Login({ onLoginSuccess, onNavigate, setMessage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        onLoginSuccess(data.token, data.user);
        setMessage('Welcome back online, ' + data.user.name);
        onNavigate('home');
      } else {
        setMessage(data.message || 'Invalid authorization parameters.');
      }
    } catch (err) {
      setMessage('Error: Unable to parse remote login script.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '70px auto', padding: '20px' }}>
      <div className="modern-card">
        <h2 style={{ marginBottom: '22px', textAlign: 'center', color: 'var(--color-accent)', fontWeight: '700' }}>Account Sign In</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="email" placeholder="Registered Email" value={email} onChange={(e) => setEmail(e.target.value)} className="modern-input" required />
          <input type="password" placeholder="Password Address" value={password} onChange={(e) => setPassword(e.target.value)} className="modern-input" required />
          <button type="submit" className="modern-btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>Log In</button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '13px', textAlign: 'center', color: 'var(--text-muted)' }}>
          New to our platform? <span onClick={() => onNavigate('signup')} style={{ color: 'var(--color-selected)', cursor: 'pointer', fontWeight: '600' }}>Register Here</span>
        </p>
      </div>
    </div>
  );
}

export default Login;

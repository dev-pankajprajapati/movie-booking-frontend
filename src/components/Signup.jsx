import React, { useState } from 'react';

function Signup({ onNavigate, setMessage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Registration Successful! Please Sign In below.');
        onNavigate('login');
      } else {
        setMessage(data.message || 'Signup processing failure.');
      }
    } catch (err) {
      setMessage('Error: Local backend network configuration down.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '70px auto', padding: '20px' }}>
      <div className="modern-card">
        <h2 style={{ marginBottom: '22px', textAlign: 'center', color: 'var(--color-accent)', fontWeight: '700' }}>Create CineVerse Account</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="modern-input" required />
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="modern-input" required />
          <input type="password" placeholder="Create Secure Password" value={password} onChange={(e) => setPassword(e.target.value)} className="modern-input" required />
          <button type="submit" className="modern-btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>Register Now</button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '13px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Already signed up? <span onClick={() => onNavigate('login')} style={{ color: 'var(--color-selected)', cursor: 'pointer', fontWeight: '600' }}>Sign In</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;

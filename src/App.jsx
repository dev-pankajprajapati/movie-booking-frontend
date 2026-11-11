import React, { useState } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/Home';
import SeatMatrix from './components/SeatMatrix';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard'; // 👈 Admin Dashboard import kiya

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('cineverse_token') || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('cineverse_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [page, setPage] = useState('home'); 
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [message, setMessage] = useState('');

  const handleLoginSuccess = (userToken, userData) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('cineverse_token', userToken);
    localStorage.setItem('cineverse_user', JSON.stringify(userData));
  };

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setPage('seats');
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setPage('home');
    setMessage('Logged out securely.');
    localStorage.removeItem('cineverse_token');
    localStorage.removeItem('cineverse_user');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navigation Header */}
      <nav style={{ background: 'var(--bg-surface)', padding: '16px 40px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h1 onClick={() => setPage('home')} style={{ color: 'var(--color-accent)', cursor: 'pointer', fontSize: '26px', fontWeight: '800', letterSpacing: '1.5px' }}>CINEVERSE</h1>
        
        <div style={{ display: 'flex', gap: '22px', alignItems: 'center' }}>
          <span onClick={() => setPage('home')} style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: page === 'home' ? 'var(--color-accent)' : 'white' }}>
            Movies
          </span>

          {token ? (
            <>
              {/* 🛡️ ROLE-BASED UI: Yeh link sirf Admin ko dikhega */}
              {user?.role === 'admin' && (
                <span 
                  onClick={() => setPage('admin')} 
                  style={{ cursor: 'pointer', fontSize: '14px', color: page === 'admin' ? 'var(--color-accent)' : '#f59e0b', fontWeight: '700', background: 'rgba(245, 158, 11, 0.1)', padding: '5px 10px', borderRadius: '6px' }}
                >
                  🛡️ Admin Panel
                </span>
              )}

              <span onClick={() => setPage('profile')} style={{ cursor: 'pointer', fontSize: '14px', color: page === 'profile' ? 'var(--color-accent)' : 'var(--color-available)', fontWeight: '600' }}>
                👤 My Tickets
              </span>
              
              <button onClick={handleLogout} className="modern-btn btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <span onClick={() => setPage('login')} style={{ cursor: 'pointer', fontSize: '14px' }}>Sign In</span>
              <span onClick={() => setPage('signup')} style={{ cursor: 'pointer', fontSize: '14px', color: 'var(--color-accent)', fontWeight: '600' }}>Register</span>
            </>
          )}
        </div>
      </nav>

      {message && (
        <div style={{ maxWidth: '650px', margin: '25px auto 0 auto', padding: '12px 18px', background: 'var(--bg-surface)', borderLeft: '4px solid var(--color-selected)', borderRadius: '6px', fontSize: '13.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{message}</span>
          <span onClick={() => setMessage('')} style={{ cursor: 'pointer', color: 'var(--color-booked)', fontWeight: 'bold' }}>✕</span>
        </div>
      )}

      {/* Component Route Render Pipeline */}
      <main style={{ paddingBottom: '60px' }}>
        {page === 'home' && <Home onSelectMovie={handleSelectMovie} token={token} onNavigate={setPage} />}
        {page === 'signup' && <Signup onNavigate={setPage} setMessage={setMessage} />}
        {page === 'login' && <Login onLoginSuccess={handleLoginSuccess} onNavigate={setPage} setMessage={setMessage} />}
        {page === 'seats' && <SeatMatrix movie={selectedMovie} token={token} onNavigate={setPage} setMessage={setMessage} />}
        {page === 'profile' && <Profile token={token} onNavigate={setPage} setMessage={setMessage} />}
        
        {/* 🛡️ Protected Admin Route Render */}
        {page === 'admin' && user?.role === 'admin' && (
          <AdminDashboard token={token} onNavigate={setPage} setMessage={setMessage} />
        )}
      </main>
    </div>
  );
}

export default App;
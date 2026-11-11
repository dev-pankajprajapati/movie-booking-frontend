import React, { useState, useEffect } from 'react';

function Home({ onSelectMovie, token, onNavigate }) {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/movies/all');
        const data = await response.json();
        if (response.ok) setMovies(data);
        else setError('Failed to extract database collections.');
      } catch (err) {
        setError('Database connection matrix failure.');
      }
    };
    fetchMovies();
  }, []);

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.genre.join(' ').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Real-time search engine query nodes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', gap: '25px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="🔍 Search movies by title, genre, keywords..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="modern-input"
          style={{ maxWidth: '450px', height: '46px' }}
        />
        {!token && (
          <button onClick={() => onNavigate('login')} className="modern-btn btn-primary">Sign In to Book Tickets</button>
        )}
      </div>

      {error && <p style={{ color: 'var(--color-booked)', marginBottom: '20px' }}>{error}</p>}

      {/* Modern Catalog Grid Matrix Map */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '35px' }}>
        {filteredMovies.map(movie => (
          <div key={movie._id} className="modern-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <img src={movie.posterUrl} alt={movie.title} style={{ width: '100%', height: '340px', objectFit: 'cover' }} />
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>{movie.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>{movie.language} • {movie.duration} Mins</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                  {movie.genre.map((g, i) => (
                    <span key={i} style={{ background: '#0b0f19', border: '1px solid #1e293b', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', color: 'var(--color-selected)', fontWeight: '500' }}>{g}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => onSelectMovie(movie)} className="modern-btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Book Tickets
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;

import React, { useState, useEffect } from 'react';

function AdminDashboard({ token, onNavigate, setMessage }) {
  const [activeTab, setActiveTab] = useState('movie');
  const [moviesList, setMoviesList] = useState([]);
  const [theatresList, setTheatresList] = useState([]);

  // Movie States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [language, setLanguage] = useState('');
  const [genre, setGenre] = useState('');
  const [posterUrl, setPosterUrl] = useState('');

  // Theatre States
  const [theatreName, setTheatreName] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [totalScreens, setTotalScreens] = useState(1);

  // Show States
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedTheatreId, setSelectedTheatreId] = useState('');
  const [showDate, setShowDate] = useState('2026-11-12');
  const [showTime, setShowTime] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');


    
  const fetchDropdownData = async () => {
    try {
      const [moviesRes, theatresRes] = await Promise.all([
        fetch('http://localhost:5000/api/movies/all'),
        fetch('http://localhost:5000/api/theatres/all')
      ]);
      if (moviesRes.ok) setMoviesList(await moviesRes.json());
      if (theatresRes.ok) setTheatresList(await theatresRes.json());
    } catch (error) {
      console.error('Dropdown data load error');
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);



  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const genreArray = genre.split(',').map(item => item.trim());
      const response = await fetch('http://localhost:5000/api/movies/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, description, duration: Number(duration), language, genre: genreArray, posterUrl })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Movie successfully add ho gayi! 🎬');
        setTitle(''); setDescription(''); setDuration(''); setLanguage(''); setGenre(''); setPosterUrl('');
        fetchDropdownData();
      } else {
        setMessage(data.message || 'Movie add nahi ho payi.');
      }
    } catch (err) {
      setMessage('Server error.');
    }
  };

  const handleAddTheatre = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/theatres/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: theatreName, location, city, totalScreens: Number(totalScreens) })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Theatre successfully add ho gaya! 🏢');
        setTheatreName(''); setLocation(''); setCity(''); setTotalScreens(1);
        fetchDropdownData();
      } else {
        setMessage(data.message || 'Theatre add nahi ho paya.');
      }
    } catch (err) {
      setMessage('Server error.');
    }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    if (!selectedMovieId || !selectedTheatreId) return setMessage('Movie aur Theatre select karein.');
    try {
      const response = await fetch('http://localhost:5000/api/shows/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          movie: selectedMovieId,
          theatre: selectedTheatreId,
          date: showDate,
          time: showTime,
          ticketPrice: Number(ticketPrice)
        })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Show aur 60 Seats ka layout ban gaya! 🎟️');
        setShowTime(''); setTicketPrice('');
      } else {
        setMessage(data.message || 'Show create nahi ho paya.');
      }
    } catch (err) {
      setMessage('Server error.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ color: 'var(--color-accent)' }}>🛡️ Admin Control Panel</h2>
        <button onClick={() => onNavigate('home')} className="modern-btn btn-secondary">← Back to Website</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid #1e293b', paddingBottom: '15px' }}>
        <button onClick={() => setActiveTab('movie')} className={`modern-btn ${activeTab === 'movie' ? 'btn-primary' : 'btn-secondary'}`}>🎬 1. Add Movie</button>
        <button onClick={() => setActiveTab('theatre')} className={`modern-btn ${activeTab === 'theatre' ? 'btn-primary' : 'btn-secondary'}`}>🏢 2. Add Theatre</button>
        <button onClick={() => setActiveTab('show')} className={`modern-btn ${activeTab === 'show' ? 'btn-primary' : 'btn-secondary'}`}>⏰ 3. Schedule Show</button>
      </div>

      {activeTab === 'movie' && (
        <div className="modern-card">
          <h3 style={{ marginBottom: '20px' }}>Add New Movie</h3>
          <form onSubmit={handleAddMovie} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Movie Title" value={title} onChange={(e) => setTitle(e.target.value)} className="modern-input" required />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="modern-input" rows="3" required />
            <div style={{ display: 'flex', gap: '15px' }}>
              <input type="number" placeholder="Duration (Mins)" value={duration} onChange={(e) => setDuration(e.target.value)} className="modern-input" required />
              <input type="text" placeholder="Language" value={language} onChange={(e) => setLanguage(e.target.value)} className="modern-input" required />
            </div>
            <input type="text" placeholder="Genres (Comma separated: Action, Sci-Fi)" value={genre} onChange={(e) => setGenre(e.target.value)} className="modern-input" required />
            <input type="url" placeholder="Poster Image URL" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} className="modern-input" required />
            <button type="submit" className="modern-btn btn-primary">Publish Movie</button>
          </form>
        </div>
      )}

      {activeTab === 'theatre' && (
        <div className="modern-card">
          <h3 style={{ marginBottom: '20px' }}>Add New Theatre</h3>
          <form onSubmit={handleAddTheatre} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Theatre Name" value={theatreName} onChange={(e) => setTheatreName(e.target.value)} className="modern-input" required />
            <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="modern-input" required />
            <div style={{ display: 'flex', gap: '15px' }}>
              <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="modern-input" required />
              <input type="number" placeholder="Total Screens" value={totalScreens} onChange={(e) => setTotalScreens(e.target.value)} className="modern-input" min="1" required />
            </div>
            <button type="submit" className="modern-btn btn-primary">Save Theatre</button>
          </form>
        </div>
      )}

      {activeTab === 'show' && (
        <div className="modern-card">
          <h3 style={{ marginBottom: '20px' }}>Schedule Show & Generate Seats</h3>
          <form onSubmit={handleCreateShow} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <select value={selectedMovieId} onChange={(e) => setSelectedMovieId(e.target.value)} className="modern-input" required>
              <option value="">-- Choose a Movie --</option>
              {moviesList.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
            </select>

            <select value={selectedTheatreId} onChange={(e) => setSelectedTheatreId(e.target.value)} className="modern-input" required>
              <option value="">-- Choose a Theatre --</option>
              {theatresList.map(t => <option key={t._id} value={t._id}>{t.name} - {t.city.toUpperCase()}</option>)}
            </select>

            <div style={{ display: 'flex', gap: '15px' }}>
              <input type="date" value={showDate} onChange={(e) => setShowDate(e.target.value)} className="modern-input" required />
              <input type="time" value={showTime} onChange={(e) => setShowTime(e.target.value)} className="modern-input" required />
            </div>

            <input type="number" placeholder="Ticket Price (₹)" value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)} className="modern-input" required />
            <button type="submit" className="modern-btn btn-primary" style={{ background: 'var(--color-available)' }}>⚡ Launch Show</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

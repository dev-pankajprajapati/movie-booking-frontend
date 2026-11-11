import React, { useState, useEffect } from 'react';

function Profile({ token, onNavigate, setMessage }) {
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null); // Track karega kaunsi ticket cancel ho rahi hai

  // 1. User ki saari bookings fetch karna
  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/bookings/my-tickets', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMyTickets(data);
      }
    } catch (err) {
      console.error('Failed fetching profile tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMyTickets();
  }, [token]);

  // 2. LOGIC: Ticket Cancel Karne Ka Function
  const handleCancelTicket = async (bookingId) => {
    // User se ek baar confirm puchhna (Accidental click se bachne ke liye)
    const isSure = window.confirm("Kya aap sach mein yeh ticket cancel karna chahte hain? Seats wapas release ho jayengi.");
    if (!isSure) return;

    try {
      setCancellingId(bookingId);
      const response = await fetch('http://localhost:5000/api/bookings/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId })
      });

      const data = await response.json();

      if (response.ok) {
        if (setMessage) setMessage('Ticket successfully cancel ho gayi hai! ❌🎟️');
        // List ko turant refresh karein taaki badge 'Cancelled' dikhe
        fetchMyTickets();
      } else {
        if (setMessage) setMessage(data.message || 'Ticket cancel nahi ho payi.');
      }
    } catch (err) {
      if (setMessage) setMessage('Network error: Cancel request fail ho gayi.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '40px auto', padding: '20px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>👤 My Dashboard Profile</h2>
        <button onClick={() => onNavigate('home')} className="modern-btn btn-secondary">← Back to Movies</button>
      </div>

      <div className="modern-card">
        <h3 style={{ borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '20px', color: 'var(--color-available)' }}>
          🍿 My Booking History
        </h3>
        
        {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading your cinema passes...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {myTickets.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Aapne abhi tak koi ticket book nahi ki hai.</p> : (
              myTickets.map(ticket => {
                const isCancelled = ticket.status === 'Cancelled';

                return (
                  <div 
                    key={ticket._id} 
                    style={{ 
                      background: '#0b0f19', 
                      border: isCancelled ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #1e293b', 
                      borderRadius: '12px', 
                      padding: '20px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      flexWrap: 'wrap', 
                      gap: '20px',
                      opacity: isCancelled ? 0.75 : 1 // Cancelled ticket thodi dim dikhegi
                    }}
                  >
                    {/* Left Side: Movie & Theatre Info */}
                    <div>
                      <h4 style={{ fontSize: '19px', color: isCancelled ? 'var(--text-muted)' : 'var(--color-accent)', marginBottom: '6px', textDecoration: isCancelled ? 'line-through' : 'none' }}>
                        {ticket.show?.movie?.title || ticket.show?.movie?.name || 'Movie Title'}
                      </h4>
                      <p style={{ fontSize: '14px', color: 'white', marginBottom: '4px' }}>
                        🏢 {ticket.show?.theatre?.name} — {ticket.show?.theatre?.location}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        🕒 Showtime: {ticket.show?.date} at {ticket.show?.time}
                      </p>
                      <p style={{ fontSize: '13px', marginTop: '8px' }}>
                        Seats: <strong style={{ color: 'var(--color-selected)' }}>{ticket.seats.join(', ')}</strong>
                      </p>
                    </div>

                    {/* Right Side: Status Badge, Price & Cancel Trigger */}
                    <div style={{ textAlign: 'right', minWidth: '140px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                      {/* Dynamic Status Badge */}
                      {isCancelled ? (
                        <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-booked)', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                          ✕ Cancelled
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-available)', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                          ✓ Confirmed
                        </span>
                      )}

                      <p style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                        Paid: ₹{ticket.totalPrice}
                      </p>

                      {/* Cancel Button (Sirf Confirmed tickets par dikhega) */}
                      {!isCancelled && (
                        <button 
                          onClick={() => handleCancelTicket(ticket._id)}
                          disabled={cancellingId === ticket._id}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--color-booked)',
                            color: 'var(--color-booked)',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: cancellingId === ticket._id ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'var(--color-booked)';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = 'var(--color-booked)';
                          }}
                        >
                          {cancellingId === ticket._id ? 'Cancelling...' : 'Cancel Ticket'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;

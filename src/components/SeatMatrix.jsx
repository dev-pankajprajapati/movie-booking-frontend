
import React, { useState, useEffect } from 'react';

function SeatMatrix({ movie, token, onNavigate, setMessage }) {
  const [showsList, setShowsList] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState('');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  const fetchMovieShows = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/shows/movie-shows?movieId=${movie._id}&date=2026-11-12`
      );

      const data = await response.json();

      if (response.ok) {
        setShowsList(data);
      }
    } catch (err) {
      setMessage('Network error loading schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movie?._id) fetchMovieShows();
  }, [movie]);

  const handleSelectShowSlot = async (show) => {
    setSelectedShow(show);

    try {
      const response = await fetch(
        `http://localhost:5000/api/shows/${show._id}/seats`
      );

      const data = await response.json();

      if (response.ok) {
        setSeats(data.seats);
        setTicketPrice(data.ticketPrice);
        setSelectedSeats([]);
        setBookingSuccessData(null);
      }
    } catch (err) {
      setMessage('Failed to render seat matrix.');
    }
  };

  const handleSeatClick = (seatNumber, status) => {
    if (status !== 'Available') return;

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  // Login redirect
  const handleProceedToPayment = async () => {
    if (!token) {
      setMessage('Booking karne ke liye pehle Login karna zaroori hai!');
      return onNavigate('login');
    }

    if (selectedSeats.length === 0) {
      return setMessage('Kripya seat select karein.');
    }

    try {
      const response = await fetch('http://localhost:5000/api/bookings/hold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          showId: selectedShow._id,
          selectedSeats
        })
      });

      const data = await response.json();

      if (response.ok) {
        setActiveBookingId(data.bookingId);
        setShowPaymentModal(true);
      } else {
        setMessage(data.message || 'Hold lock failure.');
      }
    } catch (err) {
      setMessage('API pipeline communication error.');
    }
  };

  const handleFakePaymentSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsProcessing(true);

      await new Promise(resolve => setTimeout(resolve, 1200));

      const response = await fetch('http://localhost:5000/api/bookings/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: activeBookingId
        })
      });

      const data = await response.json();

      setIsProcessing(false);
      setShowPaymentModal(false);

      if (response.ok) {
        setBookingSuccessData({
          movieTitle: movie.title,
          theatreName: selectedShow.theatre.name,
          timeSlot: selectedShow.time,
          bookedSeats: selectedSeats.join(', '),
          totalPaid: selectedSeats.length * ticketPrice
        });

        setCardNumber('');
        setCvv('');
        setSelectedSeats([]);

        handleSelectShowSlot(selectedShow);
      } else {
        setMessage(data.message || 'Payment failed.');
      }
    } catch (err) {
      setIsProcessing(false);
      setShowPaymentModal(false);
      setMessage('Confirmation breakdown.');
    }
  };

  return (
    <div style={{ maxWidth: '950px', margin: '30px auto', padding: '20px' }}>
      <button
        onClick={() => onNavigate('home')}
        className="modern-btn btn-secondary"
        style={{ marginBottom: '25px' }}
      >
        ← Back to All Movies
      </button>

      {/* Booking Success Banner */}
      {bookingSuccessData && (
        <div
          className="modern-card"
          style={{
            border: '2px solid var(--color-available)',
            background: 'rgba(16, 185, 129, 0.08)',
            marginBottom: '30px',
            textAlign: 'left',
            animation: 'fadeIn 0.5s ease'
          }}
        >
          <h2 style={{ color: 'var(--color-available)', marginBottom: '15px' }}>
            🎉 Booking Confirmed Successfully!
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              fontSize: '14px'
            }}
          >
            <div>🎬 <strong>Movie:</strong> {bookingSuccessData.movieTitle}</div>
            <div>🏢 <strong>Cinema:</strong> {bookingSuccessData.theatreName}</div>
            <div>🕒 <strong>Showtime:</strong> {bookingSuccessData.timeSlot}</div>
            <div>🪟 <strong>Seats Allocated:</strong> {bookingSuccessData.bookedSeats}</div>
            <div style={{ fontSize: '16px', color: 'white' }}>
              💵 <strong>Total Paid:</strong> ₹{bookingSuccessData.totalPaid}
            </div>
          </div>

          <p
            style={{
              marginTop: '15px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontStyle: 'italic'
            }}
          >
            *A copy of this electronic receipt reference has been appended to your secure profile dashboard.
          </p>
        </div>
      )}

      {/* Movie Info Card */}
      <div
        className="modern-card"
        style={{
          display: 'flex',
          gap: '30px',
          flexWrap: 'wrap',
          marginBottom: '30px',
          alignItems: 'center'
        }}
      >
        <img
          src={movie.posterUrl}
          alt={movie.title}
          style={{
            width: '140px',
            height: '210px',
            objectFit: 'cover',
            borderRadius: '8px'
          }}
        />

        <div style={{ flex: '1', textAlign: 'left' }}>
          <h2
            style={{
              fontSize: '26px',
              color: 'var(--color-accent)',
              marginBottom: '10px'
            }}
          >
            {movie.title}
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {movie.description}
          </p>
        </div>
      </div>

      {/* Shows Slots Container */}
      <div className="modern-card" style={{ textAlign: 'left', marginBottom: '30px' }}>
        <h3
          style={{
            fontSize: '18px',
            marginBottom: '15px',
            color: 'var(--color-selected)'
          }}
        >
          🕒 Available Cinemas & Showtimes
        </h3>

        {loading ? (
          <p>Loading schedules...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {showsList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No live shows running today.</p>
            ) : (
              showsList.map(show => (
                <div
                  key={show._id}
                  style={{
                    background: '#0b0f19',
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1px solid #1e293b',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '16px' }}>
                      🏢 {show.theatre.name}
                    </h4>

                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      📍 {show.theatre.location}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelectShowSlot(show)}
                    className="modern-btn"
                    style={{
                      background:
                        selectedShow?._id === show._id
                          ? 'var(--color-accent)'
                          : '#1e293b',
                      color: 'white',
                      padding: '8px 16px'
                    }}
                  >
                    ⚡ {show.time} (₹{show.ticketPrice})
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Interactive Matrix */}
      {seats.length > 0 && (
        <div className="modern-card" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '80%',
              height: '4px',
              background: 'var(--color-accent)',
              margin: '0 auto 30px auto',
              boxShadow: '0 2px 12px var(--color-accent)'
            }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: '10px',
              maxWidth: '500px',
              margin: '0 auto'
            }}
          >
            {seats.map(seat => {
              let bgColor = '#1e293b';

              if (seat.status === 'Booked') bgColor = 'var(--color-booked)';
              if (seat.status === 'Reserved') bgColor = 'var(--color-reserved)';
              if (selectedSeats.includes(seat.seatNumber)) {
                bgColor = 'var(--color-selected)';
              }

              return (
                <button
                  key={seat._id}
                  onClick={() => handleSeatClick(seat.seatNumber, seat.status)}
                  disabled={seat.status !== 'Available'}
                  style={{
                    background: bgColor,
                    color: 'white',
                    border: 'none',
                    padding: '12px 0',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: seat.status === 'Available' ? 'pointer' : 'not-allowed',
                    opacity: seat.status === 'Available' ? 1 : 0.4
                  }}
                >
                  {seat.seatNumber}
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: '40px',
              borderTop: '1px solid #334155',
              paddingTop: '25px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <p>
                Selected Seats:{' '}
                <strong style={{ color: 'var(--color-selected)' }}>
                  {selectedSeats.join(', ') || 'None'}
                </strong>
              </p>

              <h3>
                Total Cost:{' '}
                <span style={{ color: 'var(--color-available)' }}>
                  ₹{selectedSeats.length * ticketPrice}
                </span>
              </h3>
            </div>

            <button
              onClick={handleProceedToPayment}
              className="modern-btn btn-primary"
              style={{ width: '100%', fontSize: '16px' }}
            >
              💳 Proceed to Secure Payment Gateway
            </button>
          </div>
        </div>
      )}

      {/* Fake Payment Modal */}
      {showPaymentModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(11, 15, 25, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
        >
          <div
            className="modern-card"
            style={{
              maxWidth: '420px',
              width: '90%',
              border: '1px solid var(--color-selected)',
              background: 'var(--bg-surface)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '20px',
                alignItems: 'center'
              }}
            >
              <h3 style={{ color: 'var(--color-selected)' }}>
                💳 CineVerse Pay Gateway
              </h3>

              <span
                onClick={() => !isProcessing && setShowPaymentModal(false)}
                style={{
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  color: 'var(--color-booked)',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </span>
            </div>

            <form
              onSubmit={handleFakePaymentSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
              <input
                type="text"
                maxLength="16"
                placeholder="Fake Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="modern-input"
                required
                disabled={isProcessing}
              />

              <div style={{ display: 'flex', gap: '15px' }}>
                <input
                  type="password"
                  maxLength="3"
                  placeholder="CVV"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="modern-input"
                  required
                  disabled={isProcessing}
                />
              </div>

              <button
                type="submit"
                className="modern-btn"
                style={{
                  width: '100%',
                  background: 'var(--color-available)',
                  color: 'white'
                }}
                disabled={isProcessing}
              >
                {isProcessing
                  ? '🔐 Verifying Transaction...'
                  : `Pay ₹${selectedSeats.length * ticketPrice} & Confirm Ticket`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeatMatrix;

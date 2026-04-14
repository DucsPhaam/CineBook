import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, Ticket, Download, House, QrCode, Clock, MapPin } from '@phosphor-icons/react';

const BookingSuccess = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await api.get(`/bookings/${bookingId}`);
        if (data.booking.status !== 'success') {
          toast.error('Đơn hàng chưa được thanh toán');
          navigate('/');
          return;
        }
        setBooking(data.booking);
        setTickets(data.tickets || []);
        if (data.tickets?.length > 0) setSelectedTicket(data.tickets[0]);
      } catch (err) {
        toast.error('Không tìm thấy đơn hàng');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, navigate]);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + '₫';
  const formatDT = (dt) => new Date(dt).toLocaleString('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (loading) return (
    <div className="page-wrapper">
      <div className="loading-spinner"><div className="spinner" /></div>
    </div>
  );

  if (!booking) return null;

  const showtime = booking.showtimeId;
  const movie = showtime?.movieId;
  const room = showtime?.roomId;
  const theater = room?.theaterId;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 60, maxWidth: 860 }}>
        {/* Success Header */}
        <div className="success-header fade-in">
          <div className="success-icon-wrap">
            <CheckCircle size={70} weight="fill" color="var(--success)" />
            <div className="success-ripple" />
          </div>
          <h1 className="success-title">Đặt vé thành công! 🎉</h1>
          <p className="success-subtitle">
            Vé của bạn đã được xác nhận. QR Code đã gửi về email <strong>{booking.userId?.email}</strong>
          </p>
        </div>

        {/* Booking Summary Card */}
        <div className="booking-card fade-in">
          <div className="booking-card-header">
            <h2>Chi tiết đặt vé</h2>
            <span className="badge badge-success">Thành công</span>
          </div>

          <div className="booking-info-grid">
            <div className="booking-movie-cover">
              <img
                src={movie?.posterUrl}
                alt={movie?.title}
                onError={(e) => e.target.style.display='none'}
              />
            </div>
            <div className="booking-details">
              <div className="booking-movie-name">{movie?.title}</div>
              <div className="booking-meta-list">
                <div className="bm">
                  <Clock size={15} />
                  {formatDT(showtime?.startTime)}
                </div>
                <div className="bm">
                  <MapPin size={15} />
                  {theater?.name} | {room?.name}
                </div>
                <div className="bm">
                  <Ticket size={15} />
                  Ghế: <strong style={{ color: 'var(--primary)' }}>{booking.seats?.join(', ')}</strong>
                </div>
              </div>
              <div className="booking-total">
                Tổng tiền: <span>{formatPrice(booking.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Tickets */}
        <div className="tickets-section fade-in">
          <h2 style={{ marginBottom: 20 }}>Vé điện tử của bạn</h2>
          <div className="tickets-layout">
            {/* Ticket list */}
            <div className="ticket-list">
              {tickets.map(ticket => (
                <button
                  key={ticket._id}
                  className={`ticket-item ${selectedTicket?._id === ticket._id ? 'active' : ''}`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <Ticket size={18} />
                  <span>Ghế {ticket.seatNumber}</span>
                  <QrCode size={16} style={{ marginLeft: 'auto' }} />
                </button>
              ))}
            </div>

            {/* QR Display */}
            {selectedTicket && (
              <div className="qr-display">
                <div className="qr-ticket-card">
                  <div className="qr-movie-name">{movie?.title}</div>
                  <div className="qr-seat-label">Ghế {selectedTicket.seatNumber}</div>
                  <div className="qr-image-wrap">
                    {selectedTicket.qrCode ? (
                      <img src={selectedTicket.qrCode} alt="QR Code" className="qr-image" />
                    ) : (
                      <div className="qr-placeholder">
                        <QrCode size={60} />
                        <span>QR Code</span>
                      </div>
                    )}
                  </div>
                  <div className="qr-info">
                    <div>{theater?.name}</div>
                    <div>{room?.name} · {new Date(showtime?.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className="qr-scan-hint">Xuất trình mã QR tại quầy</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="success-actions fade-in">
          <Link to="/my-bookings" className="btn btn-outline btn-lg">
            <Ticket size={20} />
            Xem tất cả vé
          </Link>
          <Link to="/" className="btn btn-primary btn-lg">
            <House size={20} />
            Về trang chủ
          </Link>
        </div>
      </div>

      <style>{`
        .success-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .success-icon-wrap {
          position: relative;
          display: inline-block;
          margin-bottom: 20px;
        }
        .success-ripple {
          position: absolute;
          inset: -10px;
          border: 2px solid var(--success);
          border-radius: 50%;
          opacity: 0;
          animation: ripple 2s ease-out infinite;
        }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .success-title { font-size: 32px; font-weight: 900; margin-bottom: 12px; }
        .success-subtitle { font-size: 15px; color: var(--text-secondary); }
        .booking-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 28px;
          margin-bottom: 24px;
        }
        .booking-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .booking-card-header h2 { font-size: 18px; }
        .booking-info-grid { display: flex; gap: 24px; align-items: flex-start; }
        .booking-movie-cover img { width: 80px; height: 120px; border-radius: 8px; object-fit: cover; }
        .booking-movie-name { font-size: 20px; font-weight: 800; margin-bottom: 12px; }
        .booking-meta-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
        .bm { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-secondary); }
        .booking-total { font-size: 15px; color: var(--text-muted); }
        .booking-total span { font-size: 22px; font-weight: 900; color: var(--accent); margin-left: 8px; }
        .tickets-section { margin-bottom: 32px; }
        .tickets-layout { display: grid; grid-template-columns: 240px 1fr; gap: 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
        .ticket-list { border-right: 1px solid var(--border); padding: 12px; display: flex; flex-direction: column; gap: 6px; }
        .ticket-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
        }
        .ticket-item:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
        .ticket-item.active { background: rgba(229,9,20,0.1); border-color: rgba(229,9,20,0.3); color: var(--primary); }
        .qr-display { padding: 24px; display: flex; justify-content: center; }
        .qr-ticket-card {
          background: white;
          border-radius: var(--radius-md);
          padding: 20px;
          max-width: 260px;
          width: 100%;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .qr-movie-name { font-size: 14px; font-weight: 800; color: #111; margin-bottom: 4px; }
        .qr-seat-label { font-size: 24px; font-weight: 900; color: #e50914; margin-bottom: 16px; }
        .qr-image-wrap { margin-bottom: 16px; }
        .qr-image { width: 100%; border-radius: 8px; }
        .qr-placeholder { padding: 32px; color: #aaa; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .qr-info { font-size: 12px; color: #555; line-height: 1.6; margin-bottom: 12px; }
        .qr-scan-hint { font-size: 11px; background: #f5f5f5; padding: 8px; border-radius: 6px; color: #666; font-weight: 600; }
        .success-actions { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; padding-bottom: 40px; }
        @media (max-width: 640px) {
          .tickets-layout { grid-template-columns: 1fr; }
          .ticket-list { border-right: none; border-bottom: 1px solid var(--border); }
          .booking-info-grid { flex-direction: column; }
          .success-title { font-size: 24px; }
        }
      `}</style>
    </div>
  );
};

export default BookingSuccess;

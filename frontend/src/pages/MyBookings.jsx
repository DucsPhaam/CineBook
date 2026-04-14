import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Ticket, Clock, MapPin, ChevronDown, QrCode } from '@phosphor-icons/react';

const STATUS_MAP = {
  pending: { label: 'Chờ thanh toán', cls: 'badge-warning' },
  success: { label: 'Thành công', cls: 'badge-success' },
  failed: { label: 'Thất bại', cls: 'badge-error' },
  expired: { label: 'Hết hạn', cls: 'badge-muted' },
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings/my-bookings');
        setBookings(data.bookings || []);
      } catch (err) {
        toast.error('Không thể tải lịch sử đặt vé');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + '₫';
  const formatDT = (dt) => new Date(dt).toLocaleString('vi-VN', {
    day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 50, paddingBottom: 60 }}>
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Vé của tôi</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Lịch sử đặt vé và vé điện tử của bạn</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="tabs" style={{ marginBottom: 32 }}>
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'success', label: 'Thành công' },
            { key: 'pending', label: 'Chờ thanh toán' },
            { key: 'expired', label: 'Hết hạn' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`tab-btn ${filter === tab.key ? 'active' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎫</div>
            <h3>Chưa có đặt vé nào</h3>
            <p style={{ marginTop: 8, marginBottom: 24 }}>Hãy chọn một bộ phim và đặt vé ngay!</p>
            <Link to="/" className="btn btn-primary">Khám phá phim</Link>
          </div>
        ) : (
          <div className="bookings-list fade-in">
            {filtered.map(booking => {
              const showtime = booking.showtimeId;
              const movie = showtime?.movieId;
              const room = showtime?.roomId;
              const theater = room?.theaterId;
              const statusInfo = STATUS_MAP[booking.status] || STATUS_MAP.failed;

              return (
                <div key={booking._id} className="booking-item">
                  <div className="bi-poster">
                    <img
                      src={movie?.posterUrl}
                      alt={movie?.title}
                      onError={(e) => {
                        e.target.src = '';
                      }}
                    />
                  </div>
                  <div className="bi-info">
                    <div className="bi-header">
                      <h3 className="bi-title">{movie?.title || 'N/A'}</h3>
                      <span className={`badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                    </div>
                    <div className="bi-meta">
                      <span><Clock size={13} /> {showtime?.startTime ? formatDT(showtime.startTime) : 'N/A'}</span>
                      <span className="meta-sep">•</span>
                      <span><MapPin size={13} /> {theater?.name || 'N/A'} - {room?.name || 'N/A'}</span>
                    </div>
                    <div className="bi-meta">
                      <span><Ticket size={13} /> Ghế: <strong>{booking.seats?.join(', ') || 'N/A'}</strong></span>
                      <span className="meta-sep">•</span>
                      <span className="bi-price">{formatPrice(booking.totalPrice)}</span>
                    </div>
                    <div className="bi-date">Đặt lúc: {formatDT(booking.createdAt)}</div>
                  </div>
                  <div className="bi-actions">
                    {booking.status === 'success' && (
                      <Link to={`/booking-success/${booking._id}`} className="btn btn-primary btn-sm">
                        <QrCode size={16} />
                        Xem vé
                      </Link>
                    )}
                    {booking.status === 'pending' && (
                      <Link to={`/payment/${booking._id}`} className="btn btn-accent btn-sm">
                        Thanh toán
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .page-header { margin-bottom: 32px; }
        .bookings-list { display: flex; flex-direction: column; gap: 16px; }
        .booking-item {
          display: flex;
          gap: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          transition: var(--transition);
          align-items: center;
        }
        .booking-item:hover { border-color: var(--border-hover); }
        .bi-poster { flex-shrink: 0; }
        .bi-poster img { width: 60px; height: 90px; border-radius: 6px; object-fit: cover; }
        .bi-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
        .bi-header { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
        .bi-title { font-size: 16px; font-weight: 700; }
        .bi-meta { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); flex-wrap: wrap; }
        .bi-meta span { display: flex; align-items: center; gap: 4px; }
        .meta-sep { color: var(--text-muted); }
        .bi-price { color: var(--accent); font-weight: 700; font-size: 15px; }
        .bi-date { font-size: 12px; color: var(--text-muted); }
        .bi-actions { flex-shrink: 0; }
        @media (max-width: 600px) {
          .booking-item { flex-direction: column; align-items: stretch; }
          .bi-poster { display: none; }
        }
      `}</style>
    </div>
  );
};

export default MyBookings;

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SeatMap from '../components/SeatMap';
import toast from 'react-hot-toast';
import { ArrowLeft, Ticket, Clock, MapPin, CurrencyDollar, Warning } from '@phosphor-icons/react';

const SeatSelection = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  const [showtime, setShowtime] = useState(null);
  const [soldSeats, setSoldSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const fetchShowtime = useCallback(async () => {
    try {
      const { data } = await api.get(`/showtimes/${showtimeId}`);
      setShowtime(data.showtime);
      setSoldSeats(data.soldSeats || []);
      setLockedSeats(data.lockedSeats || []);
    } catch (err) {
      toast.error('Không tìm thấy suất chiếu');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [showtimeId, navigate]);

  useEffect(() => {
    fetchShowtime();
    // Refresh seat status mỗi 15 giây để cập nhật lock
    const interval = setInterval(fetchShowtime, 15000);
    return () => clearInterval(interval);
  }, [fetchShowtime]);

  // Countdown timer (chỉ hiển thị khi đã chọn ghế)
  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Phiên giữ ghế đã hết hạn!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSeatSelect = (seatId) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(s => s !== seatId);
      }
      if (prev.length >= 8) {
        toast.error('Bạn chỉ có thể chọn tối đa 8 ghế!');
        return prev;
      }
      return [...prev, seatId];
    });
  };

  const handleConfirm = async () => {
    if (selectedSeats.length === 0) {
      return toast.error('Vui lòng chọn ít nhất 1 ghế!');
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings/select-seats', {
        showtimeId,
        seats: selectedSeats,
      });
      toast.success('Ghế đã được giữ! Bạn có 5 phút để thanh toán.');
      navigate(`/payment/${data.bookingId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể giữ ghế');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (dt) => new Date(dt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (dt) => new Date(dt).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + '₫';

  const totalPrice = selectedSeats.length * (showtime?.price || 0);

  if (loading) return (
    <div className="page-wrapper">
      <div className="loading-spinner"><div className="spinner" /></div>
    </div>
  );

  if (!showtime) return null;

  const movie = showtime.movieId;
  const room = showtime.roomId;
  const theater = room?.theaterId;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        {/* Header */}
        <div className="selection-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Quay lại
          </button>
          <div>
            <h1 className="selection-title">{movie?.title}</h1>
            <div className="selection-meta">
              <span><Clock size={14} /> {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}</span>
              <span>|</span>
              <span>{formatDate(showtime.startTime)}</span>
              <span>|</span>
              <span><MapPin size={14} /> {theater?.name} - {room?.name}</span>
            </div>
          </div>
        </div>

        <div className="selection-layout">
          {/* Seat Map */}
          <div className="seat-map-container">
            <SeatMap
              room={room}
              soldSeats={soldSeats}
              lockedSeats={lockedSeats}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
            />
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h3 className="summary-title">Thông tin đặt vé</h3>

            <div className="summary-movie">
              <img
                src={movie?.posterUrl || ''}
                alt={movie?.title}
                className="summary-poster"
                onError={(e) => e.target.style.display='none'}
              />
              <div>
                <div className="summary-movie-title">{movie?.title}</div>
                <div className="summary-room">{room?.name}</div>
              </div>
            </div>

            <div className="summary-info">
              <div className="info-row">
                <span>Ngày chiếu</span>
                <span>{formatDate(showtime.startTime)}</span>
              </div>
              <div className="info-row">
                <span>Giờ chiếu</span>
                <span className="highlight">{formatTime(showtime.startTime)}</span>
              </div>
              <div className="info-row">
                <span>Rạp</span>
                <span>{theater?.name}</span>
              </div>
              <div className="info-row">
                <span>Phòng</span>
                <span>{room?.name}</span>
              </div>
            </div>

            <div className="selected-seats">
              <div className="seats-label">Ghế đã chọn</div>
              {selectedSeats.length === 0 ? (
                <div className="no-seats">
                  <Warning size={20} />
                  Chưa chọn ghế
                </div>
              ) : (
                <div className="seats-tags">
                  {selectedSeats.sort().map(s => (
                    <button
                      key={s}
                      className="seat-tag"
                      onClick={() => handleSeatSelect(s)}
                      title="Click để bỏ chọn"
                    >
                      {s} ✕
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="price-summary">
              <div className="price-row">
                <span>{selectedSeats.length} ghế × {formatPrice(showtime.price)}</span>
                <span className="total-price">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg confirm-btn"
              onClick={handleConfirm}
              disabled={selectedSeats.length === 0 || submitting}
            >
              <Ticket size={20} />
              {submitting ? 'Đang xử lý...' : `Tiến hành thanh toán (${selectedSeats.length} ghế)`}
            </button>

            <p className="seat-hint">
              💡 Ghế sẽ được giữ trong <strong>5 phút</strong> sau khi xác nhận
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .selection-header {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 40px;
        }
        .selection-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .selection-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .selection-meta span { display: flex; align-items: center; gap: 4px; }
        .selection-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 32px;
          align-items: start;
        }
        .seat-map-container { flex: 1; }

        /* Order Summary */
        .order-summary {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          position: sticky;
          top: calc(var(--header-height) + 24px);
        }
        .summary-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }
        .summary-movie {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }
        .summary-poster {
          width: 50px;
          height: 75px;
          border-radius: 6px;
          object-fit: cover;
        }
        .summary-movie-title { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
        .summary-room { font-size: 12px; color: var(--text-muted); }
        .summary-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }
        .info-row span:first-child { color: var(--text-muted); }
        .info-row span:last-child { color: var(--text-secondary); font-weight: 500; text-align: right; }
        .highlight { color: var(--accent) !important; font-weight: 700 !important; }
        .selected-seats { margin-bottom: 20px; }
        .seats-label { font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
        .no-seats { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 14px; }
        .seats-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .seat-tag {
          background: rgba(229,9,20,0.1);
          border: 1px solid rgba(229,9,20,0.3);
          color: var(--primary);
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition);
          font-family: 'Inter', sans-serif;
        }
        .seat-tag:hover { background: rgba(229,9,20,0.2); }
        .price-summary {
          margin-bottom: 20px;
          padding: 16px;
          background: rgba(245,197,24,0.05);
          border: 1px solid rgba(245,197,24,0.15);
          border-radius: var(--radius-sm);
        }
        .price-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: var(--text-secondary); }
        .total-price { font-size: 20px; font-weight: 900; color: var(--accent); }
        .confirm-btn { width: 100%; justify-content: center; font-size: 15px; margin-bottom: 12px; }
        .seat-hint { font-size: 12px; color: var(--text-muted); text-align: center; line-height: 1.6; }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          cursor: pointer;
          transition: var(--transition);
          font-family: 'Inter', sans-serif;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .back-btn:hover { color: var(--text-primary); background: rgba(255,255,255,0.1); }

        @media (max-width: 1024px) {
          .selection-layout { grid-template-columns: 1fr; }
          .order-summary { position: static; }
        }
        @media (max-width: 768px) {
          .selection-header { flex-direction: column; gap: 12px; }
          .selection-title { font-size: 20px; }
        }
      `}</style>
    </div>
  );
};

export default SeatSelection;

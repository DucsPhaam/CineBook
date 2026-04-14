import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Ticket, Clock, CreditCard, CheckCircle, Warning, ArrowLeft } from '@phosphor-icons/react';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await api.get(`/bookings/${bookingId}`);
        setBooking(data.booking);

        // Tính thời gian còn lại
        if (data.booking.expiresAt) {
          const remaining = Math.max(0, Math.floor((new Date(data.booking.expiresAt) - Date.now()) / 1000));
          setTimeLeft(remaining);
        }
      } catch (err) {
        toast.error('Không tìm thấy đơn hàng');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, navigate]);

  // Countdown
  useEffect(() => {
    if (!booking || booking.status !== 'pending') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          toast.error('Phiên đặt vé đã hết hạn!');
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [booking, navigate]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + '₫';
  const formatDT = (dt) => new Date(dt).toLocaleString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handlePayment = async () => {
    setPaying(true);
    // Simulate payment processing delay (1.5s UX effect)
    await new Promise(r => setTimeout(r, 1500));
    try {
      const { data } = await api.post('/bookings/confirm', { bookingId });
      clearInterval(timerRef.current);
      toast.success('🎉 Thanh toán thành công!');
      navigate(`/booking-success/${bookingId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thanh toán thất bại');
    } finally {
      setPaying(false);
    }
  };

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
  const isUrgent = timeLeft < 60;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 40, maxWidth: 760 }}>
        {/* Header */}
        <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: 32 }}>
          <ArrowLeft size={18} /> Quay lại
        </button>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Xác nhận thanh toán</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Kiểm tra thông tin trước khi thanh toán</p>

        {/* Timer */}
        <div className={`timer-bar ${isUrgent ? 'urgent' : ''}`}>
          <Clock size={20} />
          <span>Thời gian giữ ghế còn lại:</span>
          <strong className="timer-count">{formatTime(timeLeft)}</strong>
          {isUrgent && <span className="urgent-text">⚠️ Sắp hết hạn!</span>}
        </div>

        {/* Booking Info */}
        <div className="payment-card">
          <div className="payment-movie-info">
            <img
              src={movie?.posterUrl}
              alt={movie?.title}
              className="payment-poster"
              onError={(e) => e.target.style.display='none'}
            />
            <div className="payment-movie-details">
              <h2 className="payment-movie-title">{movie?.title}</h2>
              <div className="payment-meta-grid">
                <div className="pmeta">
                  <span className="pmeta-label">Ngày chiếu</span>
                  <span className="pmeta-value">
                    {new Date(showtime?.startTime).toLocaleDateString('vi-VN', {
                      weekday: 'long', day: 'numeric', month: 'long'
                    })}
                  </span>
                </div>
                <div className="pmeta">
                  <span className="pmeta-label">Giờ chiếu</span>
                  <span className="pmeta-value highlight">
                    {new Date(showtime?.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="pmeta">
                  <span className="pmeta-label">Rạp chiếu</span>
                  <span className="pmeta-value">{theater?.name}</span>
                </div>
                <div className="pmeta">
                  <span className="pmeta-label">Phòng</span>
                  <span className="pmeta-value">{room?.name}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="payment-divider">
            <div className="divider-line" />
            <span>Chi tiết vé</span>
            <div className="divider-line" />
          </div>

          <div className="ticket-details">
            <div className="ticket-seats">
              {booking.seats?.map(seat => (
                <div key={seat} className="ticket-seat-badge">
                  <Ticket size={14} />
                  Ghế {seat}
                </div>
              ))}
            </div>
            <div className="ticket-price-summary">
              <div className="price-item">
                <span>Số ghế</span>
                <span>{booking.seats?.length || 0} ghế</span>
              </div>
              <div className="price-item">
                <span>Đơn giá</span>
                <span>{formatPrice(showtime?.price)}/ghế</span>
              </div>
              <div className="price-total-row">
                <span>Tổng cộng</span>
                <span className="price-total-val">{formatPrice(booking.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="payment-methods">
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Phương thức thanh toán</h3>
          <div className="method-options">
            <div className="method-option active">
              <CreditCard size={24} />
              <div>
                <div className="method-name">Demo Payment</div>
                <div className="method-desc">Thanh toán giả lập (không mất tiền thật)</div>
              </div>
              <CheckCircle size={20} className="method-check" weight="fill" />
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="customer-info-card">
          <h3 style={{ marginBottom: 16, fontSize: 15, color: 'var(--text-secondary)' }}>Thông tin khách hàng</h3>
          <div className="customer-fields">
            <div className="cfield">
              <span className="cfield-label">Họ tên</span>
              <span className="cfield-val">{user?.name}</span>
            </div>
            <div className="cfield">
              <span className="cfield-label">Email</span>
              <span className="cfield-val">{user?.email}</span>
            </div>
            <div className="cfield">
              <span className="cfield-label">Vé gửi về</span>
              <span className="cfield-val" style={{ color: 'var(--success)' }}>{user?.email} ✓</span>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <button
          className="btn btn-primary btn-lg pay-btn"
          onClick={handlePayment}
          disabled={paying || timeLeft === 0}
        >
          {paying ? (
            <>
              <div className="pay-spinner" />
              Đang xử lý thanh toán...
            </>
          ) : (
            <>
              <CreditCard size={22} />
              Thanh toán {formatPrice(booking.totalPrice)}
            </>
          )}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>
          🔒 Giao dịch an toàn và được bảo mật
        </p>
      </div>

      <style>{`
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
        }
        .back-btn:hover { color: var(--text-primary); background: rgba(255,255,255,0.1); }
        .timer-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
          color: var(--info);
          padding: 14px 20px;
          border-radius: var(--radius-md);
          margin-bottom: 24px;
          font-size: 14px;
        }
        .timer-bar.urgent {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.3);
          color: var(--error);
          animation: pulse 1s ease-in-out infinite;
        }
        .timer-count { font-size: 20px; font-weight: 900; margin-left: 4px; }
        .urgent-text { margin-left: auto; font-weight: 700; }
        .payment-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 28px;
          margin-bottom: 20px;
        }
        .payment-movie-info { display: flex; gap: 20px; margin-bottom: 24px; align-items: flex-start; }
        .payment-poster { width: 80px; height: 120px; border-radius: var(--radius-sm); object-fit: cover; flex-shrink: 0; }
        .payment-movie-title { font-size: 20px; font-weight: 800; margin-bottom: 16px; }
        .payment-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .pmeta { display: flex; flex-direction: column; gap: 2px; }
        .pmeta-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; }
        .pmeta-value { font-size: 14px; color: var(--text-secondary); }
        .highlight { color: var(--accent) !important; font-weight: 700 !important; font-size: 16px !important; }
        .payment-divider { display: flex; align-items: center; gap: 16px; margin: 20px 0; }
        .divider-line { flex: 1; height: 1px; background: var(--border); }
        .payment-divider span { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); white-space: nowrap; }
        .ticket-details { display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap; }
        .ticket-seats { display: flex; flex-wrap: wrap; gap: 8px; flex: 1; }
        .ticket-seat-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(229,9,20,0.1);
          border: 1px solid rgba(229,9,20,0.25);
          color: var(--primary);
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
        }
        .ticket-price-summary { flex: 1; min-width: 200px; }
        .price-item { display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted); padding: 6px 0; }
        .price-total-row { display: flex; justify-content: space-between; font-size: 15px; font-weight: 700; color: var(--text-primary); padding-top: 12px; margin-top: 8px; border-top: 1px solid var(--border); }
        .price-total-val { font-size: 22px; color: var(--accent); font-weight: 900; }
        .payment-methods, .customer-info-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 20px;
        }
        .method-options { display: flex; flex-direction: column; gap: 10px; }
        .method-option {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: var(--radius-sm);
          border: 2px solid var(--primary);
          background: rgba(229,9,20,0.06);
          cursor: pointer;
        }
        .method-name { font-size: 15px; font-weight: 700; }
        .method-desc { font-size: 12px; color: var(--text-muted); }
        .method-check { color: var(--primary); margin-left: auto; }
        .customer-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .cfield { display: flex; flex-direction: column; gap: 4px; }
        .cfield-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; }
        .cfield-val { font-size: 14px; color: var(--text-secondary); }
        .pay-btn { width: 100%; justify-content: center; font-size: 16px; padding: 16px; }
        .pay-spinner { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @media (max-width: 600px) {
          .payment-meta-grid { grid-template-columns: 1fr; }
          .ticket-details { flex-direction: column; }
          .customer-fields { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Payment;

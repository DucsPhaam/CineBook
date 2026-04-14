import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Clock, Calendar, Star, Play, FilmStrip, Users, ArrowLeft,
  Ticket, Buildings, MapPin
} from '@phosphor-icons/react';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTheater, setSelectedTheater] = useState('');
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  // Tạo danh sách 7 ngày tới
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const formatDate = (d, i) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return {
      dayLabel: i === 0 ? 'Hôm nay' : days[d.getDay()],
      day: d.getDate(),
      month: d.getMonth() + 1,
      full: d.toISOString().split('T')[0],
    };
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const [movieRes, theatersRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get('/theaters'),
        ]);
        setMovie(movieRes.data.movie);
        setTheaters(theatersRes.data.theaters || []);
        // Set ngày mặc định là hôm nay
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
      } catch (err) {
        toast.error('Không tìm thấy phim');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id, navigate]);

  useEffect(() => {
    if (!selectedDate) return;
    const fetchShowtimes = async () => {
      try {
        const params = { movieId: id, date: selectedDate };
        if (selectedTheater) params.theaterId = selectedTheater;
        const { data } = await api.get('/showtimes', { params });
        setShowtimes(data.showtimes || []);
      } catch (err) {
        setShowtimes([]);
      }
    };
    fetchShowtimes();
  }, [id, selectedDate, selectedTheater]);

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h} giờ ${m} phút` : `${m} phút`;
  };

  const formatTime = (dt) => {
    return new Date(dt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + '₫';

  const handleBooking = (showtimeId) => {
    if (!isLoggedIn) {
      toast('Vui lòng đăng nhập để đặt vé!', { icon: '🔐' });
      navigate('/login', { state: { from: `/movies/${id}` } });
      return;
    }
    navigate(`/seat-selection/${showtimeId}`);
  };

  // Group showtimes by theater
  const showtimesByTheater = showtimes.reduce((acc, st) => {
    const theaterId = st.roomId?.theaterId?._id;
    const theaterName = st.roomId?.theaterId?.name || 'Chưa xác định';
    if (!acc[theaterId]) {
      acc[theaterId] = { name: theaterName, address: st.roomId?.theaterId?.address, showtimes: [] };
    }
    acc[theaterId].showtimes.push(st);
    return acc;
  }, {});

  if (loading) return (
    <div className="page-wrapper">
      <div className="loading-spinner"><div className="spinner" /></div>
    </div>
  );

  if (!movie) return null;

  const youtubeId = getYouTubeId(movie.trailerUrl);

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <div className="movie-hero">
        <div
          className="movie-hero-bg"
          style={{ backgroundImage: `url(${movie.posterUrl})` }}
        />
        <div className="movie-hero-overlay" />
        <div className="container movie-hero-content">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Quay lại
          </button>
          <div className="movie-detail-layout">
            {/* Poster */}
            <div className="movie-poster-detail">
              <img
                src={movie.posterUrl || ''}
                alt={movie.title}
                onError={(e) => e.target.src = ''}
              />
              {youtubeId && (
                <button className="trailer-btn" onClick={() => setShowTrailer(true)}>
                  <Play size={18} weight="fill" />
                  Xem Trailer
                </button>
              )}
            </div>

            {/* Info */}
            <div className="movie-detail-info">
              <div className="movie-status-badge">
                <span className={`badge ${movie.status === 'now-showing' ? 'badge-success' : 'badge-warning'}`}>
                  {movie.status === 'now-showing' ? '🎬 Đang chiếu' : '🔜 Sắp chiếu'}
                </span>
                {movie.ageRating && (
                  <span className="badge badge-muted">Độ tuổi: {movie.ageRating}+</span>
                )}
              </div>

              <h1 className="movie-detail-title">{movie.title}</h1>

              <div className="movie-detail-meta">
                <div className="meta-row">
                  <Clock size={16} />
                  <span>{formatDuration(movie.duration)}</span>
                </div>
                <div className="meta-row">
                  <Calendar size={16} />
                  <span>{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</span>
                </div>
                {movie.genre && (
                  <div className="genres-list">
                    {movie.genre.map(g => (
                      <span key={g} className="badge badge-info">{g}</span>
                    ))}
                  </div>
                )}
              </div>

              <p className="movie-description">{movie.description}</p>

              {movie.director && (
                <div className="movie-credits">
                  <div className="credit-item">
                    <span className="credit-label">Đạo diễn</span>
                    <span className="credit-value">{movie.director}</span>
                  </div>
                  {movie.cast && movie.cast.length > 0 && (
                    <div className="credit-item">
                      <span className="credit-label">Diễn viên</span>
                      <span className="credit-value">{movie.cast.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes */}
      {movie.status === 'now-showing' && (
        <div className="container" style={{ marginTop: 48 }}>
          <h2 className="section-title" style={{ marginBottom: 24 }}>Lịch chiếu</h2>

          {/* Date Picker */}
          <div className="date-picker">
            {dates.map((d, i) => {
              const formatted = {
                dayLabel: i === 0 ? 'Hôm nay' : ['CN','T2','T3','T4','T5','T6','T7'][d.getDay()],
                day: d.getDate(),
                month: d.getMonth() + 1,
                full: d.toISOString().split('T')[0],
              };
              return (
                <button
                  key={formatted.full}
                  className={`date-btn ${selectedDate === formatted.full ? 'active' : ''}`}
                  onClick={() => setSelectedDate(formatted.full)}
                >
                  <span className="date-label">{formatted.dayLabel}</span>
                  <span className="date-day">{formatted.day}</span>
                  <span className="date-month">Tháng {formatted.month}</span>
                </button>
              );
            })}
          </div>

          {/* Theater Filter */}
          <div className="theater-filter">
            <button
              className={`tab-btn ${!selectedTheater ? 'active' : ''}`}
              onClick={() => setSelectedTheater('')}
            >
              Tất cả rạp
            </button>
            {theaters.map(t => (
              <button
                key={t._id}
                className={`tab-btn ${selectedTheater === t._id ? 'active' : ''}`}
                onClick={() => setSelectedTheater(t._id)}
              >
                {t.name.replace('CineTicket ', '')}
              </button>
            ))}
          </div>

          {/* Showtimes by Theater */}
          {Object.keys(showtimesByTheater).length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-icon">📅</div>
              <h3>Không có lịch chiếu</h3>
              <p>Vui lòng chọn ngày khác</p>
            </div>
          ) : (
            <div className="showtime-theaters">
              {Object.entries(showtimesByTheater).map(([tid, tData]) => (
                <div key={tid} className="theater-showtime-card">
                  <div className="theater-info-header">
                    <Buildings size={20} />
                    <div>
                      <div className="theater-card-name">{tData.name}</div>
                      {tData.address && (
                        <div className="theater-card-address">
                          <MapPin size={12} />
                          {tData.address}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="showtime-times">
                    {tData.showtimes.map(st => (
                      <button
                        key={st._id}
                        className="showtime-item"
                        onClick={() => handleBooking(st._id)}
                      >
                        <div className="showtime-time">{formatTime(st.startTime)}</div>
                        <div className="showtime-details">
                          <span>{st.roomId?.name}</span>
                          <span className="price-tag">{formatPrice(st.price)}</span>
                        </div>
                        {st.language && <span className="lang-badge">{st.language}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trailer Modal */}
      {showTrailer && youtubeId && (
        <div className="modal-overlay" onClick={() => setShowTrailer(false)}>
          <div className="trailer-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTrailer(false)}>✕</button>
            <div className="iframe-wrap">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title="Trailer"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .movie-hero {
          position: relative;
          min-height: calc(100vh * 0.75);
          display: flex;
          align-items: flex-end;
          padding-bottom: 60px;
        }
        .movie-hero-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center top;
          filter: blur(2px) brightness(0.3);
          transform: scale(1.05);
        }
        .movie-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(8,8,15,0.3) 0%,
            rgba(8,8,15,0.5) 50%,
            rgba(8,8,15,0.95) 100%
          );
        }
        .movie-hero-content {
          position: relative;
          z-index: 1;
          padding-top: var(--header-height);
          width: 100%;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 32px;
          transition: var(--transition);
          font-family: 'Inter', sans-serif;
        }
        .back-btn:hover { color: var(--text-primary); background: rgba(255,255,255,0.12); }
        .movie-detail-layout {
          display: flex;
          gap: 48px;
          align-items: flex-start;
        }
        .movie-poster-detail {
          width: 240px;
          flex-shrink: 0;
        }
        .movie-poster-detail img {
          width: 100%;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
        }
        .trailer-btn {
          width: 100%;
          margin-top: 12px;
          background: rgba(255,255,255,0.1);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 10px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }
        .trailer-btn:hover { background: rgba(229,9,20,0.2); border-color: var(--primary); }
        .movie-detail-info { flex: 1; }
        .movie-status-badge { display: flex; gap: 8px; margin-bottom: 16px; }
        .movie-detail-title { font-size: clamp(24px, 3vw, 42px); font-weight: 900; margin-bottom: 20px; }
        .movie-detail-meta { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; margin-bottom: 24px; }
        .meta-row { display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 14px; }
        .genres-list { display: flex; gap: 6px; flex-wrap: wrap; }
        .movie-description { color: var(--text-secondary); line-height: 1.8; font-size: 15px; margin-bottom: 24px; }
        .movie-credits { display: flex; flex-direction: column; gap: 12px; }
        .credit-item { display: flex; gap: 16px; }
        .credit-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); width: 80px; flex-shrink: 0; margin-top: 2px; }
        .credit-value { font-size: 14px; color: var(--text-secondary); }

        /* Date picker */
        .date-picker {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          overflow-x: auto;
          padding-bottom: 8px;
        }
        .date-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
          min-width: 80px;
          font-family: 'Inter', sans-serif;
        }
        .date-btn:hover { border-color: var(--primary); color: var(--text-primary); }
        .date-btn.active { background: var(--primary); border-color: var(--primary); color: white; }
        .date-label { font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
        .date-day { font-size: 22px; font-weight: 800; line-height: 1; }
        .date-month { font-size: 11px; margin-top: 2px; opacity: 0.8; }
        .theater-filter { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }

        /* Showtimes */
        .showtime-theaters { display: flex; flex-direction: column; gap: 16px; }
        .theater-showtime-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .theater-info-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 20px;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid var(--border);
          color: var(--text-secondary);
        }
        .theater-card-name { font-size: 15px; font-weight: 700; color: var(--text-primary); }
        .theater-card-address { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted); margin-top: 4px; }
        .showtime-times { display: flex; flex-wrap: wrap; gap: 10px; padding: 16px 20px; }
        .showtime-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 16px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: var(--transition);
          font-family: 'Inter', sans-serif;
          position: relative;
        }
        .showtime-item:hover { border-color: var(--primary); background: rgba(229,9,20,0.06); }
        .showtime-time { font-size: 18px; font-weight: 800; color: var(--text-primary); }
        .showtime-details { display: flex; gap: 8px; align-items: center; margin-top: 4px; }
        .showtime-details span { font-size: 12px; color: var(--text-muted); }
        .price-tag { color: var(--accent) !important; font-weight: 700 !important; }
        .lang-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--info);
          color: white;
          font-size: 9px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
        }

        /* Trailer modal */
        .trailer-modal {
          width: 90vw;
          max-width: 860px;
          position: relative;
        }
        .trailer-modal .modal-close {
          position: absolute;
          top: -40px;
          right: 0;
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 6px;
        }
        .iframe-wrap {
          aspect-ratio: 16/9;
        }
        .iframe-wrap iframe {
          width: 100%;
          height: 100%;
          border-radius: var(--radius-md);
        }

        @media (max-width: 768px) {
          .movie-detail-layout { flex-direction: column; gap: 24px; }
          .movie-poster-detail { width: 180px; }
          .movie-detail-title { font-size: 24px; }
          .movie-hero { min-height: auto; }
        }
      `}</style>
    </div>
  );
};

export default MovieDetail;

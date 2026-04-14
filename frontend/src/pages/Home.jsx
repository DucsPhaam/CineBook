import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';
import { FilmSlate, SlidersHorizontal, MagnifyingGlass } from '@phosphor-icons/react';
import toast from 'react-hot-toast';

const GENRES = ['Action', 'Sci-Fi', 'Drama', 'Comedy', 'Horror', 'Romance', 'Adventure', 'Thriller', 'Mystery', 'Animation'];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState(searchParams.get('status') || '');
  const [activeGenre, setActiveGenre] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeStatus) params.status = activeStatus;
      if (activeGenre) params.genre = activeGenre;
      if (searchTerm) params.search = searchTerm;

      const { data } = await api.get('/movies', { params });
      setMovies(data.movies || []);

      if (!activeStatus && !activeGenre && !searchTerm) {
        const ns = data.movies.filter(m => m.status === 'now-showing');
        const cs = data.movies.filter(m => m.status === 'coming-soon');
        setNowShowing(ns);
        setComingSoon(cs);
      } else {
        setNowShowing([]);
        setComingSoon([]);
      }
    } catch (err) {
      toast.error('Không thể tải danh sách phim');
    } finally {
      setLoading(false);
    }
  }, [activeStatus, activeGenre, searchTerm]);

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlStatus = searchParams.get('status') || '';
    setSearchTerm(urlSearch);
    setActiveStatus(urlStatus);
  }, [searchParams]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleStatusFilter = (status) => {
    setActiveStatus(status);
    setSearchParams(status ? { status } : {});
  };

  const isFiltered = activeStatus || activeGenre || searchTerm;

  return (
    <div className="page-wrapper">
      {/* Hero Banner */}
      {!isFiltered && (
        <div className="hero-banner">
          <div className="hero-bg" />
          <div className="hero-content container">
            <div className="hero-badge">
              <FilmSlate size={16} weight="fill" />
              Chào mừng đến với CineTicket
            </div>
            <h1 className="hero-title">
              Trải nghiệm điện ảnh<br />
              <span className="gradient-text">đỉnh cao</span>
            </h1>
            <p className="hero-desc">
              Đặt vé xem phim trực tuyến dễ dàng, chọn ghế linh hoạt,<br />
              nhận vé điện tử ngay lập tức.
            </p>
            <div className="hero-actions">
              <Link to="/?status=now-showing" className="btn btn-primary btn-lg">
                Phim đang chiếu
              </Link>
              <Link to="/?status=coming-soon" className="btn btn-outline btn-lg">
                Sắp chiếu
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ paddingTop: isFiltered ? '40px' : '60px' }}>
        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-tabs">
            <button
              className={`tab-btn ${!activeStatus ? 'active' : ''}`}
              onClick={() => handleStatusFilter('')}
            >
              Tất cả
            </button>
            <button
              className={`tab-btn ${activeStatus === 'now-showing' ? 'active' : ''}`}
              onClick={() => handleStatusFilter('now-showing')}
            >
              Đang chiếu
            </button>
            <button
              className={`tab-btn ${activeStatus === 'coming-soon' ? 'active' : ''}`}
              onClick={() => handleStatusFilter('coming-soon')}
            >
              Sắp chiếu
            </button>
          </div>

          <div className="filter-right">
            <div className="search-inline">
              <MagnifyingGlass size={16} />
              <input
                type="text"
                placeholder="Tìm phim..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (!e.target.value) setSearchParams({});
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchParams(searchTerm ? { search: searchTerm } : {});
                  }
                }}
                className="filter-search-input"
              />
            </div>

            <div className="genre-select-wrap">
              <SlidersHorizontal size={16} />
              <select
                className="genre-select"
                value={activeGenre}
                onChange={(e) => setActiveGenre(e.target.value)}
              >
                <option value="">Thể loại</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : isFiltered ? (
          /* Filtered view */
          <div>
            <div className="section-header">
              <h2 className="section-title">
                {searchTerm ? `Kết quả tìm: "${searchTerm}"` :
                 activeStatus === 'now-showing' ? 'Phim đang chiếu' :
                 activeStatus === 'coming-soon' ? 'Phim sắp chiếu' :
                 `Thể loại: ${activeGenre}`}
              </h2>
              <span className="text-muted">{movies.length} phim</span>
            </div>
            {movies.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎬</div>
                <h3>Không tìm thấy phim nào</h3>
                <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            ) : (
              <div className="movies-grid fade-in">
                {movies.map(m => <MovieCard key={m._id} movie={m} />)}
              </div>
            )}
          </div>
        ) : (
          /* Home view - phân loại */
          <div>
            {nowShowing.length > 0 && (
              <section className="movie-section">
                <div className="section-header">
                  <h2 className="section-title">Đang chiếu</h2>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleStatusFilter('now-showing')}
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="movies-grid fade-in">
                  {nowShowing.slice(0, 6).map(m => <MovieCard key={m._id} movie={m} />)}
                </div>
              </section>
            )}

            {comingSoon.length > 0 && (
              <section className="movie-section">
                <div className="section-header">
                  <h2 className="section-title">Sắp chiếu</h2>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleStatusFilter('coming-soon')}
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="movies-grid fade-in">
                  {comingSoon.slice(0, 6).map(m => <MovieCard key={m._id} movie={m} />)}
                </div>
              </section>
            )}

            {nowShowing.length === 0 && comingSoon.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">🎬</div>
                <h3>Chưa có phim nào</h3>
                <p>Quay lại sau nhé!</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .hero-banner {
          position: relative;
          min-height: 520px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 20% 50%, rgba(229,9,20,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.1) 0%, transparent 50%),
            linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
        }
        .hero-content {
          position: relative;
          z-index: 1;
          padding-top: var(--header-height);
          padding-bottom: 40px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(229,9,20,0.1);
          border: 1px solid rgba(229,9,20,0.3);
          color: var(--primary);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .hero-title {
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 20px;
          color: var(--text-primary);
        }
        .gradient-text {
          background: linear-gradient(135deg, var(--primary) 0%, #ff6b35 50%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-desc {
          font-size: 16px;
          color: var(--text-secondary);
          margin-bottom: 36px;
          line-height: 1.8;
        }
        .hero-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .filters-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .filter-right {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .search-inline {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 8px 14px;
          color: var(--text-muted);
        }
        .filter-search-input {
          background: none;
          border: none;
          outline: none;
          font-size: 14px;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          width: 160px;
        }
        .filter-search-input::placeholder { color: var(--text-muted); }
        .genre-select-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 8px 14px;
          color: var(--text-muted);
        }
        .genre-select {
          background: none;
          border: none;
          outline: none;
          font-size: 14px;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          cursor: pointer;
        }
        .genre-select option { background: var(--bg-card); }
        .movie-section {
          margin-bottom: 56px;
        }
        .text-muted { color: var(--text-muted); font-size: 14px; }
        @media (max-width: 768px) {
          .filters-bar { flex-direction: column; align-items: stretch; }
          .filter-right { flex-direction: column; }
          .filter-search-input { width: 100%; }
          .hero-desc br { display: none; }
        }
      `}</style>
    </div>
  );
};

export default Home;

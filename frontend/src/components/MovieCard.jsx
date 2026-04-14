import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Play } from '@phosphor-icons/react';

const MovieCard = ({ movie }) => {
  if (!movie) return null;

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}g ${m}p` : `${m}p`;
  };

  return (
    <div className="movie-card">
      <div className="movie-poster-wrap">
        <img
          src={movie.posterUrl || 'https://via.placeholder.com/300x450/13131f/a0a0b8?text=No+Image'}
          alt={movie.title}
          className="movie-poster"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x450/13131f/a0a0b8?text=No+Image';
          }}
        />
        <div className="movie-overlay">
          <Link to={`/movies/${movie._id}`} className="play-btn">
            <Play size={24} weight="fill" />
          </Link>
        </div>
        <div className="movie-badge-wrap">
          <span className={`badge ${movie.status === 'now-showing' ? 'badge-success' : 'badge-warning'}`}>
            {movie.status === 'now-showing' ? 'Đang chiếu' : 'Sắp chiếu'}
          </span>
        </div>
        {movie.ageRating && (
          <div className="age-rating">{movie.ageRating}</div>
        )}
      </div>

      <div className="movie-info">
        <Link to={`/movies/${movie._id}`}>
          <h3 className="movie-title">{movie.title}</h3>
        </Link>
        <div className="movie-meta">
          {movie.duration && (
            <span className="meta-item">
              <Clock size={12} />
              {formatDuration(movie.duration)}
            </span>
          )}
          {movie.genre && movie.genre.length > 0 && (
            <span className="meta-item genre-tag">{movie.genre[0]}</span>
          )}
        </div>
        <Link to={`/movies/${movie._id}`} className="btn btn-primary btn-sm book-btn">
          {movie.status === 'now-showing' ? 'Đặt vé' : 'Xem chi tiết'}
        </Link>
      </div>

      <style>{`
        .movie-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: var(--transition-slow);
          cursor: pointer;
        }
        .movie-card:hover {
          border-color: var(--primary);
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(229,9,20,0.2);
        }
        .movie-poster-wrap {
          position: relative;
          aspect-ratio: 2/3;
          overflow: hidden;
        }
        .movie-poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .movie-card:hover .movie-poster {
          transform: scale(1.06);
        }
        .movie-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-slow);
        }
        .movie-card:hover .movie-overlay {
          background: rgba(0,0,0,0.5);
        }
        .play-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transform: scale(0.6);
          transition: var(--transition-slow);
          box-shadow: 0 4px 20px var(--primary-glow);
        }
        .movie-card:hover .play-btn {
          opacity: 1;
          transform: scale(1);
        }
        .movie-badge-wrap {
          position: absolute;
          top: 10px;
          left: 10px;
        }
        .age-rating {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0,0,0,0.7);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .movie-info {
          padding: 14px;
        }
        .movie-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-decoration: none;
          transition: var(--transition);
        }
        .movie-title:hover { color: var(--primary); }
        .movie-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .genre-tag {
          background: rgba(255,255,255,0.06);
          padding: 2px 8px;
          border-radius: 4px;
          color: var(--text-secondary);
        }
        .book-btn {
          width: 100%;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default MovieCard;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FilmSlate, Ticket, User, SignOut, SignIn, List, X,
  MagnifyingGlass, ChartBar, House
} from '@phosphor-icons/react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <FilmSlate size={28} weight="fill" />
          <span>CineTicket</span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <House size={16} />
            Trang chủ
          </Link>
          <Link to="/?status=now-showing" className="nav-link">Đang chiếu</Link>
          <Link to="/?status=coming-soon" className="nav-link">Sắp chiếu</Link>
          {isAdmin && (
            <Link to="/admin" className="nav-link admin-link">
              <ChartBar size={16} />
              Admin
            </Link>
          )}
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Search */}
          <button
            className="nav-icon-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Tìm kiếm"
          >
            <MagnifyingGlass size={20} />
          </button>

          {isLoggedIn ? (
            <div className="user-menu">
              <button className="user-avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="user-avatar">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="user-name-short">{user?.name?.split(' ')[0]}</span>
              </button>
              {menuOpen && (
                <div className="user-dropdown fade-in">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className="dropdown-name">{user?.name}</div>
                      <div className="dropdown-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item">
                    <User size={16} />
                    Hồ sơ
                  </Link>
                  <Link to="/my-bookings" className="dropdown-item">
                    <Ticket size={16} />
                    Vé của tôi
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="dropdown-item">
                      <ChartBar size={16} />
                      Quản trị viên
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <SignOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">
                <SignIn size={16} />
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="mobile-menu-btn nav-icon-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div className="search-bar fade-in">
          <form onSubmit={handleSearch} className="search-form">
            <MagnifyingGlass size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm phim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="button" className="search-close" onClick={() => setSearchOpen(false)}>
              <X size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu fade-in">
          <Link to="/" className="mobile-nav-link">Trang chủ</Link>
          <Link to="/?status=now-showing" className="mobile-nav-link">Đang chiếu</Link>
          <Link to="/?status=coming-soon" className="mobile-nav-link">Sắp chiếu</Link>
          {isLoggedIn && (
            <>
              <Link to="/profile" className="mobile-nav-link">Hồ sơ</Link>
              <Link to="/my-bookings" className="mobile-nav-link">Vé của tôi</Link>
              {isAdmin && <Link to="/admin" className="mobile-nav-link">Quản trị viên</Link>}
              <button className="mobile-nav-link danger-text" onClick={handleLogout}>Đăng xuất</button>
            </>
          )}
          {!isLoggedIn && (
            <>
              <Link to="/login" className="mobile-nav-link">Đăng nhập</Link>
              <Link to="/register" className="mobile-nav-link">Đăng ký</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

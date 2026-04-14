import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FilmSlate,      // ← thay vì Film
  ChartBar,
  Buildings,
  Door,
  Calendar,
  Ticket,
  Users,
  SignOut,
  List,
  X,
  House
} from '@phosphor-icons/react';

const NAV_ITEMS = [
  { path: '/admin', icon: ChartBar, label: 'Dashboard', exact: true },
  { path: '/admin/movies', icon: FilmSlate, label: 'Quản lý phim' },        // ← đã sửa
  { path: '/admin/theaters', icon: Buildings, label: 'Cụm rạp' },
  { path: '/admin/rooms', icon: Door, label: 'Phòng chiếu' },
  { path: '/admin/showtimes', icon: Calendar, label: 'Lịch chiếu' },
  { path: '/admin/bookings', icon: Ticket, label: 'Đơn hàng' },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <FilmSlate size={24} weight="fill" />
            {sidebarOpen && <span>CineTicket</span>}
          </Link>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={18} /> : <List size={18} />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="sidebar-user">
            <div className="su-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="su-info">
              <div className="su-name">{user?.name}</div>
              <div className="su-role">Admin</div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
              title={!sidebarOpen ? item.label : ''}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}

          <div className="sidebar-divider" />

          <Link to="/" className="sidebar-nav-item" title={!sidebarOpen ? 'Trang chủ' : ''}>
            <House size={20} />
            {sidebarOpen && <span>Trang chủ</span>}
          </Link>

          <button className="sidebar-nav-item danger" onClick={handleLogout} title={!sidebarOpen ? 'Đăng xuất' : ''}>
            <SignOut size={20} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`admin-main ${sidebarOpen ? '' : 'expanded'}`}>
        <div className="admin-content">
          {children}
        </div>
      </main>

      <style>{`
        /* (giữ nguyên style như bạn đã viết) */
        .admin-layout { display: flex; min-height: 100vh; background: var(--bg-primary); }
        .admin-sidebar { width: 240px; background: var(--bg-secondary); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 50; transition: width 0.25s ease; overflow: hidden; }
        .admin-sidebar.collapsed { width: 64px; }
        /* ... phần style còn lại giữ nguyên ... */
      `}</style>
    </div>
  );
};

export default AdminLayout;
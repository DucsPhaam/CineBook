import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MagnifyingGlass } from '@phosphor-icons/react';

const STATUS_MAP = {
  pending: { label: 'Chờ TT', cls: 'badge-warning' },
  success: { label: 'Thành công', cls: 'badge-success' },
  failed: { label: 'Thất bại', cls: 'badge-error' },
  expired: { label: 'Hết hạn', cls: 'badge-muted' },
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/bookings', { params: { page, limit: 20, status: status || undefined } });
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } catch { toast.error('Không thể tải đơn hàng'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [page, status]);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + '₫';
  const formatDT = (dt) => new Date(dt).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const filtered = bookings.filter(b => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      b.userId?.name?.toLowerCase().includes(s) ||
      b.userId?.email?.toLowerCase().includes(s) ||
      b.showtimeId?.movieId?.title?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="admin-page fade-in">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý đơn hàng</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Tổng {total} đơn hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="tabs">
          {[
            { key: '', label: 'Tất cả' },
            { key: 'success', label: 'Thành công' },
            { key: 'pending', label: 'Chờ TT' },
            { key: 'expired', label: 'Hết hạn' },
          ].map(tab => (
            <button key={tab.key} className={`tab-btn ${status === tab.key ? 'active' : ''}`} onClick={() => { setStatus(tab.key); setPage(1); }}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <MagnifyingGlass size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Tìm theo tên, email, phim..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, minWidth: 260 }}
          />
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
          <table>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Phim</th>
                <th>Rạp</th>
                <th>Suất chiếu</th>
                <th>Ghế</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(booking => {
                const statusInfo = STATUS_MAP[booking.status] || STATUS_MAP.failed;
                const showtime = booking.showtimeId;
                return (
                  <tr key={booking._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{booking.userId?.name || 'N/A'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{booking.userId?.email}</div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                      {showtime?.movieId?.title || 'N/A'}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {showtime?.roomId?.theaterId?.name?.replace('CineTicket ', '') || 'N/A'}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {showtime?.startTime ? new Date(showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      {' '}
                      {showtime?.startTime ? new Date(showtime.startTime).toLocaleDateString('vi-VN') : ''}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {booking.seats?.map(s => (
                          <span key={s} style={{ background: 'rgba(229,9,20,0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatPrice(booking.totalPrice)}</td>
                    <td><span className={`badge ${statusInfo.cls}`}>{statusInfo.label}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDT(booking.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-state-icon">🎫</div>
            <h3>Không có đơn hàng nào</h3>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Trang trước</button>
          <span style={{ padding: '6px 16px', color: 'var(--text-secondary)', fontSize: 14 }}>Trang {page} / {Math.ceil(total / 20)}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Trang sau →</button>
        </div>
      )}

      <style>{`
        .admin-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .admin-page-title { font-size: 22px; font-weight: 800; }
      `}</style>
    </div>
  );
};

export default AdminBookings;

import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, PencilSimple, Trash, X, Warning } from '@phosphor-icons/react';

const AdminShowtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    movieId: '', roomId: '', startDate: '', startTime: '',
    price: '90000', language: 'VIE'
  });

  const fetchData = async () => {
    try {
      const [stRes, moviesRes, roomsRes, theatersRes] = await Promise.all([
        api.get('/showtimes/all'),
        api.get('/movies', { params: { limit: 100 } }),
        api.get('/rooms'),
        api.get('/theaters'),
      ]);
      setShowtimes(stRes.data.showtimes || []);
      setMovies(moviesRes.data.movies || []);
      setRooms(roomsRes.data.rooms || []);
      setTheaters(theatersRes.data.theaters || []);
    } catch { toast.error('Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({ movieId: movies[0]?._id || '', roomId: rooms[0]?._id || '', startDate: '', startTime: '09:00', price: '90000', language: 'VIE' });
    setShowModal(true);
  };

  const getMovieDuration = (movieId) => {
    const movie = movies.find(m => m._id === movieId);
    return movie?.duration || 120;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.movieId || !form.roomId || !form.startDate || !form.startTime) {
      return toast.error('Vui lòng điền đầy đủ thông tin!');
    }
    setSaving(true);
    try {
      const startTime = new Date(`${form.startDate}T${form.startTime}:00`);
      const duration = getMovieDuration(form.movieId);
      const endTime = new Date(startTime.getTime() + (duration + 15) * 60 * 1000);

      const payload = {
        movieId: form.movieId,
        roomId: form.roomId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        price: parseInt(form.price),
        language: form.language,
      };

      if (editItem) {
        await api.put(`/showtimes/${editItem._id}`, payload);
        toast.success('Cập nhật lịch chiếu thành công!');
      } else {
        await api.post('/showtimes', payload);
        toast.success('Tạo lịch chiếu thành công!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa suất chiếu này?')) return;
    try {
      await api.delete(`/showtimes/${id}`);
      toast.success('Đã xóa suất chiếu');
      setShowtimes(prev => prev.filter(s => s._id !== id));
    } catch { toast.error('Không thể xóa suất chiếu'); }
  };

  const formatDT = (dt) => new Date(dt).toLocaleString('vi-VN', {
    day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + '₫';

  const getRoomsByTheater = (theaterId) => rooms.filter(r => {
    const tId = r.theaterId?._id || r.theaterId;
    return tId === theaterId;
  });

  return (
    <div className="admin-page fade-in">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Lịch chiếu phim</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{showtimes.length} suất chiếu</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Thêm suất chiếu
        </button>
      </div>

      <div className="table-wrapper">
        {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
          <table>
            <thead>
              <tr>
                <th>Phim</th>
                <th>Rạp / Phòng</th>
                <th>Bắt đầu</th>
                <th>Kết thúc</th>
                <th>Giá</th>
                <th>Ngôn ngữ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map(st => (
                <tr key={st._id}>
                  <td>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <img
                        src={st.movieId?.posterUrl}
                        alt={st.movieId?.title}
                        style={{ width: 30, height: 45, borderRadius: 4, objectFit: 'cover' }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                        {st.movieId?.title || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{st.roomId?.theaterId?.name || 'N/A'}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{st.roomId?.name || 'N/A'}</div>
                    </div>
                  </td>
                  <td>{formatDT(st.startTime)}</td>
                  <td>{formatDT(st.endTime)}</td>
                  <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatPrice(st.price)}</td>
                  <td><span className="badge badge-info">{st.language}</span></td>
                  <td>
                    <button
                      className="btn btn-sm"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                      onClick={() => handleDelete(st._id)}
                    >
                      <Trash size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && showtimes.length === 0 && (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-state-icon">📅</div>
            <h3>Chưa có suất chiếu</h3>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>Thêm suất chiếu</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="conflict-notice">
              <Warning size={16} />
              Hệ thống sẽ tự động kiểm tra xung đột lịch chiếu trong cùng phòng
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Phim *</label>
                <select className="form-input" value={form.movieId} onChange={e => setForm(p => ({ ...p, movieId: e.target.value }))} required>
                  <option value="">-- Chọn phim --</option>
                  {movies.map(m => <option key={m._id} value={m._id}>{m.title} ({m.duration} phút)</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cụm rạp *</label>
                <select className="form-input" value={form.theaterId} onChange={e => {
                  setForm(p => ({ ...p, theaterId: e.target.value, roomId: getRoomsByTheater(e.target.value)[0]?._id || '' }));
                }}>
                  <option value="">-- Chọn cụm rạp --</option>
                  {theaters.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Phòng chiếu *</label>
                <select className="form-input" value={form.roomId} onChange={e => setForm(p => ({ ...p, roomId: e.target.value }))} required>
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.theaterId?.name} - {r.name} ({r.totalSeats} ghế)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Ngày chiếu *</label>
                  <input type="date" className="form-input" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Giờ chiếu *</label>
                  <input type="time" className="form-input" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá vé (VND) *</label>
                  <input type="number" className="form-input" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} min="0" step="1000" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngôn ngữ</label>
                  <select className="form-input" value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))}>
                    <option value="VIE">Tiếng Việt (VIE)</option>
                    <option value="ENG">Tiếng Anh (ENG)</option>
                    <option value="SUB">Phụ đề (SUB)</option>
                  </select>
                </div>
              </div>

              {form.movieId && (
                <div className="showtime-estimate">
                  <strong>Thời lượng phim:</strong> {getMovieDuration(form.movieId)} phút
                  {form.startDate && form.startTime && (
                    <> → Kết thúc: {(() => {
                      const start = new Date(`${form.startDate}T${form.startTime}`);
                      const end = new Date(start.getTime() + (getMovieDuration(form.movieId) + 15) * 60000);
                      return end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                    })()} (bao gồm 15 phút quảng cáo)</>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Đang kiểm tra...' : 'Tạo suất chiếu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .admin-page-title { font-size: 22px; font-weight: 800; }
        .conflict-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--warning);
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: var(--radius-sm);
          padding: 10px 14px;
          margin-bottom: 20px;
        }
        .showtime-estimate {
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: var(--radius-sm);
          padding: 10px 14px;
          font-size: 13px;
          color: var(--info);
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};

export default AdminShowtimes;

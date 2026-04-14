import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, PencilSimple, Trash, X, MagnifyingGlass } from '@phosphor-icons/react';

const GENRES = ['Action', 'Sci-Fi', 'Drama', 'Comedy', 'Horror', 'Romance', 'Adventure', 'Thriller', 'Mystery', 'Animation'];
const STATUS_OPTIONS = [{ value: 'now-showing', label: 'Đang chiếu' }, { value: 'coming-soon', label: 'Sắp chiếu' }];
const AGE_OPTIONS = ['P', 'K', '13', '16', '18'];

const EMPTY_FORM = {
  title: '', description: '', duration: '', releaseDate: '',
  genre: [], director: '', cast: '', ageRating: 'P',
  posterUrl: '', trailerUrl: '', status: 'now-showing',
};

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMovie, setEditMovie] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchMovies = async () => {
    try {
      const { data } = await api.get('/movies', { params: { limit: 100 } });
      setMovies(data.movies || []);
    } catch { toast.error('Không thể tải danh sách phim'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMovies(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditMovie(null);
    setShowModal(true);
  };

  const openEdit = (movie) => {
    setEditMovie(movie);
    setForm({
      title: movie.title, description: movie.description,
      duration: movie.duration, releaseDate: movie.releaseDate?.split('T')[0] || '',
      genre: movie.genre || [], director: movie.director || '',
      cast: (movie.cast || []).join(', '), ageRating: movie.ageRating || 'P',
      posterUrl: movie.posterUrl || '', trailerUrl: movie.trailerUrl || '',
      status: movie.status,
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const toggleGenre = (g) => {
    setForm(p => ({
      ...p,
      genre: p.genre.includes(g) ? p.genre.filter(x => x !== g) : [...p.genre, g]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        duration: parseInt(form.duration),
        cast: form.cast.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (editMovie) {
        await api.put(`/movies/${editMovie._id}`, payload);
        toast.success('Cập nhật phim thành công!');
      } else {
        await api.post('/movies', payload);
        toast.success('Thêm phim thành công!');
      }
      setShowModal(false);
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Xóa phim "${title}"?`)) return;
    try {
      await api.delete(`/movies/${id}`);
      toast.success('Đã xóa phim');
      setMovies(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa phim');
    }
  };

  const filtered = movies.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page fade-in">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý phim</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{movies.length} phim trong hệ thống</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Thêm phim
        </button>
      </div>

      {/* Search */}
      <div className="admin-search">
        <MagnifyingGlass size={18} className="search-icon-admin" />
        <input
          type="text"
          className="form-input"
          placeholder="Tìm theo tên phim..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 44 }}
        />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Phim</th>
                <th>Thể loại</th>
                <th>Thời lượng</th>
                <th>Trạng thái</th>
                <th>Ngày phát hành</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(movie => (
                <tr key={movie._id}>
                  <td>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        style={{ width: 36, height: 54, borderRadius: 4, objectFit: 'cover' }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{movie.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{movie.director}</div>
                      </div>
                    </div>
                  </td>
                  <td>{movie.genre?.join(', ') || '—'}</td>
                  <td>{movie.duration} phút</td>
                  <td>
                    <span className={`badge ${movie.status === 'now-showing' ? 'badge-success' : 'badge-warning'}`}>
                      {movie.status === 'now-showing' ? 'Đang chiếu' : 'Sắp chiếu'}
                    </span>
                  </td>
                  <td>{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(movie)}>
                        <PencilSimple size={15} />
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                        onClick={() => handleDelete(movie._id, movie.title)}
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div className="empty-state" style={{ padding: '40px' }}>
            <div>🎬</div>
            <p>Không tìm thấy phim nào</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>{editMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Tên phim *</label>
                  <input name="title" className="form-input" value={form.title} onChange={handleFormChange} required placeholder="Tên phim" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Mô tả *</label>
                  <textarea name="description" className="form-input" value={form.description} onChange={handleFormChange} required placeholder="Nội dung phim" rows={3} style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Thời lượng (phút) *</label>
                  <input type="number" name="duration" className="form-input" value={form.duration} onChange={handleFormChange} required min="1" placeholder="120" />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày phát hành *</label>
                  <input type="date" name="releaseDate" className="form-input" value={form.releaseDate} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái *</label>
                  <select name="status" className="form-input" value={form.status} onChange={handleFormChange}>
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Độ tuổi</label>
                  <select name="ageRating" className="form-input" value={form.ageRating} onChange={handleFormChange}>
                    {AGE_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Đạo diễn</label>
                  <input name="director" className="form-input" value={form.director} onChange={handleFormChange} placeholder="Tên đạo diễn" />
                </div>
                <div className="form-group">
                  <label className="form-label">Diễn viên (cách nhau bởi dấu phẩy)</label>
                  <input name="cast" className="form-input" value={form.cast} onChange={handleFormChange} placeholder="Diễn viên 1, Diễn viên 2" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">URL Poster</label>
                  <input name="posterUrl" className="form-input" value={form.posterUrl} onChange={handleFormChange} placeholder="https://..." />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">URL Trailer (YouTube)</label>
                  <input name="trailerUrl" className="form-input" value={form.trailerUrl} onChange={handleFormChange} placeholder="https://youtube.com/watch?v=..." />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Thể loại</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                    {GENRES.map(g => (
                      <button
                        key={g}
                        type="button"
                        className={`badge ${form.genre.includes(g) ? 'badge-primary' : 'badge-muted'}`}
                        style={{ cursor: 'pointer', fontSize: 13, padding: '5px 14px' }}
                        onClick={() => toggleGenre(g)}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : (editMovie ? 'Cập nhật' : 'Thêm phim')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .admin-page-title { font-size: 22px; font-weight: 800; }
        .admin-search { position: relative; margin-bottom: 20px; max-width: 400px; }
        .search-icon-admin { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
      `}</style>
    </div>
  );
};

export default AdminMovies;

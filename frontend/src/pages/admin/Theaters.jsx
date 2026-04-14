import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, PencilSimple, Trash, X, MapPin, Phone } from '@phosphor-icons/react';

const AdminTheaters = () => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', city: 'Hà Nội', phone: '' });
  const [saving, setSaving] = useState(false);

  const fetchTheaters = async () => {
    try {
      const { data } = await api.get('/theaters');
      setTheaters(data.theaters || []);
    } catch { toast.error('Không thể tải danh sách'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTheaters(); }, []);

  const openCreate = () => {
    setForm({ name: '', address: '', city: 'Hà Nội', phone: '' });
    setEditItem(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, address: item.address, city: item.city || 'Hà Nội', phone: item.phone || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/theaters/${editItem._id}`, form);
        toast.success('Cập nhật thành công!');
      } else {
        await api.post('/theaters', form);
        toast.success('Tạo cụm rạp thành công!');
      }
      setShowModal(false);
      fetchTheaters();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa cụm rạp "${name}"? Toàn bộ phòng chiếu sẽ bị xóa.`)) return;
    try {
      await api.delete(`/theaters/${id}`);
      toast.success('Đã xóa cụm rạp');
      setTheaters(prev => prev.filter(t => t._id !== id));
    } catch (err) { toast.error(err.response?.data?.message || 'Không thể xóa'); }
  };

  return (
    <div className="admin-page fade-in">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Cụm rạp chiếu phim</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{theaters.length} cụm rạp</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Thêm cụm rạp
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div className="theaters-grid">
          {theaters.map(theater => (
            <div key={theater._id} className="theater-card-admin">
              <div className="tca-header">
                <div className="tca-initial">{theater.name[0]}</div>
                <div className="tca-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(theater)}>
                    <PencilSimple size={16} />
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                    onClick={() => handleDelete(theater._id, theater.name)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
              <h3 className="tca-name">{theater.name}</h3>
              <div className="tca-info">
                <span><MapPin size={13} /> {theater.address}</span>
                {theater.phone && <span><Phone size={13} /> {theater.phone}</span>}
              </div>
              <div className="tca-city">{theater.city}</div>
            </div>
          ))}
          {theaters.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state-icon">🏢</div>
              <h3>Chưa có cụm rạp</h3>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>{editItem ? 'Chỉnh sửa cụm rạp' : 'Thêm cụm rạp mới'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Tên cụm rạp *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="CineTicket Hà Nội" />
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ *</label>
                <input className="form-input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required placeholder="Số nhà, đường, quận" />
              </div>
              <div className="form-group">
                <label className="form-label">Thành phố</label>
                <select className="form-input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                  {['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Huế'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="024-3334-4444" />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : (editItem ? 'Cập nhật' : 'Tạo cụm rạp')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .admin-page-title { font-size: 22px; font-weight: 800; }
        .theaters-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .theater-card-admin {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          transition: var(--transition);
        }
        .theater-card-admin:hover { border-color: var(--border-hover); }
        .tca-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
        .tca-initial {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 900;
          color: white;
        }
        .tca-actions { display: flex; gap: 6px; }
        .tca-name { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; }
        .tca-info { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
        .tca-info span { display: flex; align-items: flex-start; gap: 6px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
        .tca-city {
          display: inline-block;
          background: rgba(59,130,246,0.1);
          color: var(--info);
          border: 1px solid rgba(59,130,246,0.2);
          padding: 3px 10px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default AdminTheaters;

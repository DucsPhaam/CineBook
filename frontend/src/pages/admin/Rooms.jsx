import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, PencilSimple, Trash, X } from '@phosphor-icons/react';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ theaterId: '', name: '', type: 'standard', layoutRows: 8, layoutCols: 10, aisles: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [roomsRes, theatersRes] = await Promise.all([api.get('/rooms'), api.get('/theaters')]);
      setRooms(roomsRes.data.rooms || []);
      setTheaters(theatersRes.data.theaters || []);
    } catch { toast.error('Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({ theaterId: theaters[0]?._id || '', name: '', type: 'standard', layoutRows: 8, layoutCols: 10, aisles: '' });
    setShowModal(true);
  };

  const openEdit = (room) => {
    setEditItem(room);
    setForm({
      theaterId: room.theaterId?._id || room.theaterId,
      name: room.name,
      type: room.type || 'standard',
      layoutRows: room.layout?.rows || 8,
      layoutCols: room.layout?.columns || 10,
      aisles: (room.layout?.aisles || []).join(', '),
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        theaterId: form.theaterId,
        name: form.name,
        type: form.type,
        layout: {
          rows: parseInt(form.layoutRows),
          columns: parseInt(form.layoutCols),
          aisles: form.aisles ? form.aisles.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [],
        }
      };
      if (editItem) {
        await api.put(`/rooms/${editItem._id}`, payload);
        toast.success('Cập nhật phòng thành công!');
      } else {
        await api.post('/rooms', payload);
        toast.success('Tạo phòng chiếu thành công!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa phòng chiếu "${name}"?`)) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success('Đã xóa phòng chiếu');
      setRooms(prev => prev.filter(r => r._id !== id));
    } catch (err) { toast.error('Không thể xóa phòng'); }
  };

  const TYPES = [
    { value: 'standard', label: 'Standard', color: '#3b82f6' },
    { value: 'vip', label: 'VIP', color: '#f59e0b' },
    { value: 'imax', label: 'IMAX', color: '#22c55e' },
    { value: '4dx', label: '4DX', color: '#a855f7' },
  ];

  return (
    <div className="admin-page fade-in">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Phòng chiếu</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{rooms.length} phòng chiếu</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Thêm phòng
        </button>
      </div>

      <div className="table-wrapper">
        {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
          <table>
            <thead>
              <tr>
                <th>Tên phòng</th>
                <th>Cụm rạp</th>
                <th>Loại</th>
                <th>Sơ đồ</th>
                <th>Tổng ghế</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => {
                const typeInfo = TYPES.find(t => t.value === room.type) || TYPES[0];
                return (
                  <tr key={room._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{room.name}</td>
                    <td>{room.theaterId?.name || '—'}</td>
                    <td>
                      <span className="badge" style={{
                        background: typeInfo.color + '20',
                        color: typeInfo.color,
                        border: `1px solid ${typeInfo.color}40`
                      }}>
                        {typeInfo.label}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {room.layout?.rows || 8} hàng × {room.layout?.columns || 10} cột
                    </td>
                    <td>{room.totalSeats} ghế</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(room)}>
                          <PencilSimple size={15} />
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                          onClick={() => handleDelete(room._id, room.name)}
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && rooms.length === 0 && (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-state-icon">🎭</div>
            <h3>Chưa có phòng chiếu</h3>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>{editItem ? 'Chỉnh sửa phòng chiếu' : 'Thêm phòng chiếu'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Cụm rạp *</label>
                <select className="form-input" value={form.theaterId} onChange={e => setForm(p => ({ ...p, theaterId: e.target.value }))} required>
                  <option value="">-- Chọn cụm rạp --</option>
                  {theaters.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tên phòng *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Phòng 1 - Standard" />
              </div>
              <div className="form-group">
                <label className="form-label">Loại phòng</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      className="badge"
                      style={{
                        padding: '6px 16px',
                        cursor: 'pointer',
                        fontSize: 13,
                        background: form.type === t.value ? t.color + '25' : 'rgba(255,255,255,0.05)',
                        color: form.type === t.value ? t.color : 'var(--text-muted)',
                        border: `1px solid ${form.type === t.value ? t.color + '60' : 'var(--border)'}`,
                      }}
                      onClick={() => setForm(p => ({ ...p, type: t.value }))}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Số hàng</label>
                  <input type="number" className="form-input" value={form.layoutRows} onChange={e => setForm(p => ({ ...p, layoutRows: e.target.value }))} min="1" max="26" />
                </div>
                <div className="form-group">
                  <label className="form-label">Số cột (ghế/hàng)</label>
                  <input type="number" className="form-input" value={form.layoutCols} onChange={e => setForm(p => ({ ...p, layoutCols: e.target.value }))} min="1" max="30" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Lối đi sau cột số (cách nhau bởi dấu phẩy)</label>
                <input className="form-input" value={form.aisles} onChange={e => setForm(p => ({ ...p, aisles: e.target.value }))} placeholder="VD: 4, 8" />
                <small style={{ color: 'var(--text-muted)', fontSize: 12 }}>Tổng ghế: {form.layoutRows * form.layoutCols}</small>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : (editItem ? 'Cập nhật' : 'Tạo phòng')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .admin-page-title { font-size: 22px; font-weight: 800; }
      `}</style>
    </div>
  );
};

export default AdminRooms;

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { User, Envelope, Lock, FloppyDisk, Ticket } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, login, token } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    password: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp!');
    }
    if (form.password && form.password.length < 6) {
      return toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
    }
    setSaving(true);
    try {
      const payload = { name: form.name };
      if (form.password) payload.password = form.password;
      const { data } = await api.put('/auth/profile', payload);
      login(data.user, token);
      toast.success('Cập nhật thành công!');
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 50, paddingBottom: 60, maxWidth: 680 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Hồ sơ cá nhân</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>Quản lý thông tin tài khoản của bạn</p>

        {/* Avatar Card */}
        <div className="profile-avatar-card">
          <div className="profile-avatar-big">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="profile-name">{user?.name}</div>
            <div className="profile-email">{user?.email}</div>
            <span className={`badge ${user?.role === 'admin' ? 'badge-warning' : 'badge-info'}`} style={{ marginTop: 8 }}>
              {user?.role === 'admin' ? '👑 Admin' : '🎬 Customer'}
            </span>
          </div>
          <Link to="/my-bookings" className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}>
            <Ticket size={16} />
            Vé của tôi
          </Link>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h3 className="form-section-title">Thông tin cơ bản</h3>

            <div className="form-group">
              <label className="form-label">
                <User size={14} style={{ marginRight: 6 }} />
                Họ và tên
              </label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Envelope size={14} style={{ marginRight: 6 }} />
                Email
              </label>
              <input
                type="email"
                className="form-input"
                value={user?.email}
                readOnly
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: 12 }}>Email không thể thay đổi</small>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Đổi mật khẩu <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 13 }}>(bỏ trống nếu không muốn đổi)</span></h3>

            <div className="form-group">
              <label className="form-label">
                <Lock size={14} style={{ marginRight: 6 }} />
                Mật khẩu mới
              </label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={form.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={14} style={{ marginRight: 6 }} />
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            <FloppyDisk size={20} />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>

      <style>{`
        .profile-avatar-card {
          display: flex;
          align-items: center;
          gap: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .profile-avatar-big {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          font-weight: 900;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 20px var(--primary-glow);
        }
        .profile-name { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
        .profile-email { font-size: 14px; color: var(--text-muted); }
        .profile-form { display: flex; flex-direction: column; gap: 28px; }
        .form-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 28px;
        }
        .form-section-title { font-size: 15px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
      `}</style>
    </div>
  );
};

export default Profile;

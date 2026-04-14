import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { User, Envelope, Lock, UserPlus, FilmSlate, Eye, EyeSlash } from '@phosphor-icons/react';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Vui lòng điền đầy đủ thông tin!');
    if (form.password !== form.confirmPassword) return toast.error('Mật khẩu xác nhận không khớp!');
    if (form.password.length < 6) return toast.error('Mật khẩu phải có ít nhất 6 ký tự!');

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password
      });
      login(data.user, data.token);
      toast.success('Đăng ký thành công! Chào mừng bạn!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length < 6 ? 0 : form.password.length < 8 ? 1 : form.password.length < 12 ? 2 : 3;
  const strengthLabels = ['', 'Yếu', 'Trung bình', 'Mạnh'];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#22c55e'];

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-container fade-in">
        <Link to="/" className="auth-logo">
          <FilmSlate size={32} weight="fill" />
          CineTicket
        </Link>

        <div className="auth-card">
          <h1 className="auth-title">Tạo tài khoản</h1>
          <p className="auth-subtitle">Đăng ký miễn phí để đặt vé và nhận ưu đãi!</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <div className="input-icon-wrap">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  className="form-input input-with-icon"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-icon-wrap">
                <Envelope size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  className="form-input input-with-icon"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div className="input-icon-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="form-input input-with-icon"
                  placeholder="Tối thiểu 6 ký tự"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="strength-bar"
                        style={{ background: i <= strength ? strengthColors[strength] : 'var(--border)' }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu</label>
              <div className="input-icon-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input input-with-icon"
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              <UserPlus size={20} />
              {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="auth-switch">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; padding: 20px; }
        .auth-bg {
          position: fixed; inset: 0;
          background: radial-gradient(ellipse at 70% 40%, rgba(229,9,20,0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 30% 60%, rgba(99,102,241,0.08) 0%, transparent 50%), var(--bg-primary);
          z-index: 0;
        }
        .auth-container { position: relative; z-index: 1; width: 100%; max-width: 420px; }
        .auth-logo { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 24px; font-weight: 900; color: var(--text-primary); text-decoration: none; margin-bottom: 32px; }
        .auth-logo svg { color: var(--primary); }
        .auth-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 36px; box-shadow: var(--shadow-lg); }
        .auth-title { font-size: 26px; font-weight: 900; text-align: center; margin-bottom: 8px; }
        .auth-subtitle { font-size: 14px; color: var(--text-muted); text-align: center; margin-bottom: 28px; }
        .input-icon-wrap { position: relative; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .input-icon-right { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; padding: 4px; transition: var(--transition); }
        .input-icon-right:hover { color: var(--text-primary); }
        .input-with-icon { padding-left: 44px; padding-right: 40px; }
        .password-strength { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
        .strength-bars { display: flex; gap: 4px; flex: 1; }
        .strength-bar { height: 4px; flex: 1; border-radius: 2px; transition: var(--transition); }
        .auth-submit { width: 100%; justify-content: center; margin-top: 8px; font-size: 15px; }
        .auth-switch { text-align: center; margin-top: 24px; font-size: 14px; color: var(--text-muted); }
        .auth-switch a { color: var(--primary); font-weight: 600; text-decoration: none; }
        .auth-switch a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default Register;

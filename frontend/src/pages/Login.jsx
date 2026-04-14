import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Envelope, Lock, SignIn, FilmSlate, Eye, EyeSlash } from '@phosphor-icons/react';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Vui lòng điền đầy đủ thông tin!');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Chào mừng, ${data.user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@cineticket.vn', password: 'admin123' });
    else setForm({ email: 'customer@cineticket.vn', password: 'customer123' });
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-container fade-in">
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <FilmSlate size={32} weight="fill" />
          CineTicket
        </Link>

        <div className="auth-card">
          <h1 className="auth-title">Đăng nhập</h1>
          <p className="auth-subtitle">Chào mừng trở lại! Đăng nhập để tiếp tục.</p>

          {/* Demo accounts */}
          <div className="demo-accounts">
            <button className="demo-btn" type="button" onClick={() => fillDemo('customer')}>
              🎬 Demo Customer
            </button>
            <button className="demo-btn admin" type="button" onClick={() => fillDemo('admin')}>
              👑 Demo Admin
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-icon-wrap">
                <Envelope size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  className="form-input input-with-icon"
                  placeholder="email@example.com"
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
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              <SignIn size={20} />
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="auth-switch">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 20px;
        }
        .auth-bg {
          position: fixed;
          inset: 0;
          background: 
            radial-gradient(ellipse at 30% 40%, rgba(229,9,20,0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, rgba(59,130,246,0.08) 0%, transparent 50%),
            var(--bg-primary);
          z-index: 0;
        }
        .auth-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
        }
        .auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 24px;
          font-weight: 900;
          color: var(--text-primary);
          text-decoration: none;
          margin-bottom: 32px;
        }
        .auth-logo svg { color: var(--primary); }
        .auth-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 36px;
          box-shadow: var(--shadow-lg);
        }
        .auth-title { font-size: 26px; font-weight: 900; text-align: center; margin-bottom: 8px; }
        .auth-subtitle { font-size: 14px; color: var(--text-muted); text-align: center; margin-bottom: 28px; }
        .demo-accounts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 24px;
          padding: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
        }
        .demo-btn {
          padding: 8px;
          border-radius: 6px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          font-family: 'Inter', sans-serif;
        }
        .demo-btn:hover { background: rgba(255,255,255,0.1); color: var(--text-primary); }
        .demo-btn.admin:hover { background: rgba(245,197,24,0.08); border-color: rgba(245,197,24,0.2); color: var(--accent); }
        .input-icon-wrap { position: relative; }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .input-icon-right {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          transition: var(--transition);
        }
        .input-icon-right:hover { color: var(--text-primary); }
        .input-with-icon { padding-left: 44px; padding-right: 40px; }
        .auth-submit { width: 100%; justify-content: center; margin-top: 8px; font-size: 15px; }
        .auth-switch { text-align: center; margin-top: 24px; font-size: 14px; color: var(--text-muted); }
        .auth-switch a { color: var(--primary); font-weight: 600; text-decoration: none; }
        .auth-switch a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default Login;

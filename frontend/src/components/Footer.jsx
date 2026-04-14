import React from 'react';
import { Link } from 'react-router-dom';
import { FilmSlate, InstagramLogo, FacebookLogo, YoutubeLogo, MapPin, Phone, Envelope } from '@phosphor-icons/react';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <FilmSlate size={28} weight="fill" />
            <span>CineTicket</span>
          </Link>
          <p className="footer-desc">
            Hệ thống đặt vé xem phim trực tuyến hàng đầu Việt Nam. Trải nghiệm xem phim đẳng cấp tại các rạp chiếu phim hiện đại.
          </p>
          <div className="footer-socials">
            <a href="#!" className="social-btn"><FacebookLogo size={20} /></a>
            <a href="#!" className="social-btn"><InstagramLogo size={20} /></a>
            <a href="#!" className="social-btn"><YoutubeLogo size={20} /></a>
          </div>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-col-title">Khám phá</h4>
          <ul>
            <li><Link to="/?status=now-showing">Đang chiếu</Link></li>
            <li><Link to="/?status=coming-soon">Sắp chiếu</Link></li>
            <li><Link to="/my-bookings">Vé của tôi</Link></li>
            <li><Link to="/profile">Hồ sơ</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-col-title">Hỗ trợ</h4>
          <ul>
            <li><a href="#!">Câu hỏi thường gặp</a></li>
            <li><a href="#!">Chính sách hoàn vé</a></li>
            <li><a href="#!">Điều khoản sử dụng</a></li>
            <li><a href="#!">Chính sách bảo mật</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4 className="footer-col-title">Liên hệ</h4>
          <ul>
            <li><MapPin size={16} /> 72A Nguyễn Trãi, Hà Nội</li>
            <li><Phone size={16} /> 024-3334-4444</li>
            <li><Envelope size={16} /> support@cineticket.vn</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 CineTicket. Tất cả quyền được bảo lưu.</p>
        <p>Built with ❤️ in Vietnam</p>
      </div>
    </div>

    <style>{`
      .footer {
        background: var(--bg-secondary);
        border-top: 1px solid var(--border);
        padding: 64px 0 32px;
        margin-top: 80px;
      }
      .footer-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 48px;
        margin-bottom: 48px;
      }
      .footer-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 20px;
        font-weight: 800;
        color: var(--text-primary);
        text-decoration: none;
        margin-bottom: 16px;
      }
      .footer-logo svg { color: var(--primary); }
      .footer-desc {
        font-size: 14px;
        color: var(--text-muted);
        line-height: 1.7;
        margin-bottom: 24px;
      }
      .footer-socials {
        display: flex;
        gap: 10px;
      }
      .social-btn {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(255,255,255,0.05);
        border: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        transition: var(--transition);
        text-decoration: none;
      }
      .social-btn:hover {
        background: rgba(229,9,20,0.1);
        color: var(--primary);
        border-color: var(--primary);
      }
      .footer-col-title {
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--text-primary);
        margin-bottom: 20px;
      }
      .footer-links-col ul, .footer-contact ul {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .footer-links-col a {
        font-size: 14px;
        color: var(--text-muted);
        text-decoration: none;
        transition: var(--transition);
      }
      .footer-links-col a:hover { color: var(--text-primary); }
      .footer-contact li {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--text-muted);
      }
      .footer-bottom {
        border-top: 1px solid var(--border);
        padding-top: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        color: var(--text-muted);
      }
      @media (max-width: 768px) {
        .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
        .footer-brand { grid-column: 1 / -1; }
        .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
      }
      @media (max-width: 480px) {
        .footer-grid { grid-template-columns: 1fr; }
      }
    `}</style>
  </footer>
);

export default Footer;

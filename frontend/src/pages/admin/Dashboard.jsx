import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  FilmSlate,           // ← thay vì Film
  Buildings,
  Ticket,
  CurrencyCircleDollar,
  TrendUp,
  Users
} from '@phosphor-icons/react';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + '20', color }}>
      <Icon size={24} weight="fill" />
    </div>
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-label">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="tooltip-val" style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' && p.name?.includes('Doanh')
              ? new Intl.NumberFormat('vi-VN').format(p.value) + '₫'
              : p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [movieRevenue, setMovieRevenue] = useState([]);
  const [theaterRevenue, setTheaterRevenue] = useState([]);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, dailyRes, movieRes, theaterRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/revenue/daily'),
          api.get(`/admin/revenue/by-movie?period=${period}`),
          api.get(`/admin/revenue/by-theater?period=${period}`),
        ]);
        setStats(statsRes.data.stats);
        setDailyRevenue(dailyRes.data.revenue.map(d => ({
          date: d._id,
          'Doanh thu': d.revenue,
          'Đơn hàng': d.count,
        })));
        setMovieRevenue(movieRes.data.revenue.slice(0, 6));
        setTheaterRevenue(theaterRes.data.revenue);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [period]);

  const formatCurrency = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M₫`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K₫`;
    return `${n}₫`;
  };

  if (loading) return (
    <div className="loading-spinner" style={{ minHeight: '80vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Tổng quan hệ thống CineTicket</p>
        </div>
        <div className="tabs">
          <button className={`tab-btn ${period === 'week' ? 'active' : ''}`} onClick={() => setPeriod('week')}>7 ngày</button>
          <button className={`tab-btn ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>30 ngày</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard icon={FilmSlate} label="Tổng phim" value={stats?.totalMovies || 0} color="#3b82f6" />   {/* ← đã sửa */}
        <StatCard icon={Buildings} label="Cụm rạp" value={stats?.totalTheaters || 0} color="#22c55e" />
        <StatCard icon={Users} label="Khách hàng" value={stats?.totalUsers || 0} color="#a855f7" />
        <StatCard icon={Ticket} label="Đặt vé thành công" value={stats?.totalBookings || 0} color="#f59e0b" />
        <StatCard
          icon={CurrencyCircleDollar}
          label="Doanh thu tháng này"
          value={formatCurrency(stats?.monthlyRevenue || 0)}
          color="#e50914"
          sub="Tháng hiện tại"
        />
        <StatCard
          icon={TrendUp}
          label="Đặt vé hôm nay"
          value={stats?.todayBookings || 0}
          color="#06b6d4"
          sub="Trong ngày"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        {/* Daily Revenue Line Chart */}
        <div className="chart-card wide">
          <div className="chart-header">
            <h3>Doanh thu 7 ngày gần đây</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={formatCurrency} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="Doanh thu"
                stroke="#e50914"
                strokeWidth={2.5}
                dot={{ fill: '#e50914', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Theater Revenue */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Doanh thu theo rạp</h3>
          </div>
          {theaterRevenue.length === 0 ? (
            <div className="no-data">Chưa có dữ liệu</div>
          ) : (
            <div className="theater-rev-list">
              {theaterRevenue.map((t, i) => (
                <div key={t._id} className="theater-rev-item">
                  <div className="tr-rank">#{i + 1}</div>
                  <div className="tr-info">
                    <div className="tr-name">{t.name.replace('CineTicket ', '')}</div>
                    <div className="tr-bookings">{t.bookings} đơn hàng</div>
                  </div>
                  <div className="tr-revenue">{formatCurrency(t.revenue)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Movie Revenue Bar Chart */}
      <div className="chart-card" style={{ marginTop: 20 }}>
        <div className="chart-header">
          <h3>Top phim theo doanh thu</h3>
        </div>
        {movieRevenue.length === 0 ? (
          <div className="no-data">Chưa có dữ liệu doanh thu</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={movieRevenue} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={formatCurrency} />
              <YAxis type="category" dataKey="title" stroke="var(--text-muted)" tick={{ fontSize: 11 }} width={140} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Doanh thu" radius={[0, 4, 4, 0]}>
                {movieRevenue.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#e50914' : i === 1 ? '#f59e0b' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <style>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          transition: var(--transition);
        }
        .stat-card:hover { border-color: var(--border-hover); transform: translateY(-2px); }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-value { font-size: 24px; font-weight: 900; color: var(--text-primary); line-height: 1; margin-bottom: 6px; }
        .stat-label { font-size: 13px; color: var(--text-muted); }
        .stat-sub { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
        .charts-row {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
          margin-top: 4px;
        }
        .chart-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
        }
        .chart-card.wide { grid-column: 1; }
        .chart-header { margin-bottom: 20px; }
        .chart-header h3 { font-size: 15px; font-weight: 700; }
        .chart-tooltip {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          box-shadow: var(--shadow-md);
        }
        .tooltip-label { color: var(--text-muted); margin-bottom: 4px; font-size: 12px; }
        .tooltip-val { font-weight: 700; }
        .theater-rev-list { display: flex; flex-direction: column; gap: 12px; }
        .theater-rev-item { display: flex; align-items: center; gap: 12px; }
        .tr-rank { width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: var(--text-muted); flex-shrink: 0; }
        .tr-info { flex: 1; }
        .tr-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .tr-bookings { font-size: 12px; color: var(--text-muted); }
        .tr-revenue { font-size: 15px; font-weight: 700; color: var(--accent); }
        .no-data { text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 14px; }
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .charts-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

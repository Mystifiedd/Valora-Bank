import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, extractApiError } from '../../utils/format';

/* ── Inline SVG icons for stat cards ── */
const DollarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const UsersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const ActivityIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
  </svg>
);

/* ── Donut chart (CSS conic-gradient) ── */
function DonutChart({ segments, total }) {
  let gradient = 'conic-gradient(var(--color-gray-200) 0% 100%)';
  if (total > 0) {
    let cumulative = 0;
    const stops = segments.map((s) => {
      const start = cumulative;
      cumulative += (s.value / total) * 100;
      return `${s.color} ${start}% ${cumulative}%`;
    });
    gradient = `conic-gradient(${stops.join(', ')})`;
  }

  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: gradient }}>
        <div className="donut__center">
          <span className="donut__center-value">{(total || 0).toLocaleString()}</span>
          <span className="donut__center-label">Total</span>
        </div>
      </div>
      <div className="donut-legend">
        {segments.map((s) => (
          <span key={s.label} className="donut-legend__item">
            <span className="donut-legend__dot" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Simple line chart (SVG) ── */
function MiniLineChart({ data, width = 480, height = 180 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const padX = 40;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padY + chartH - (d.value / max) * chartH,
  }));

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${line} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`;

  return (
    <div className="line-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = padY + chartH - pct * chartH;
          return <line key={pct} x1={padX} x2={width - padX} y1={y} y2={y} stroke="rgba(17,24,39,0.06)" />;
        })}
        <path d={area} fill="rgba(15,73,198,0.08)" />
        <path d={line} fill="none" stroke="var(--color-primary-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="var(--color-primary-500)" />
            <text x={p.x} y={height - 4} textAnchor="middle" fontSize="10" fill="var(--color-gray-400)">{data[i].label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

const getLastMonths = (count) => {
  const now = new Date();
  return Array.from({ length: count }, (_, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - idx), 1);
    const label = d.toLocaleString('en-US', { month: 'short' });
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { label, value };
  });
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError('');
      try {
        const months = getLastMonths(6);
        const [trendRes, activeUsersRes, activeAccountsRes, activeEmployeesRes, branchesRes, pendingLoansRes] = await Promise.all([
          Promise.all(months.map((m) => api.get('/admin/stats', { params: { month: m.value } }))),
          api.get('/admin/users', { params: { is_active: true, page: 1, page_size: 1 } }),
          api.get('/admin/accounts', { params: { status: 'active', page: 1, page_size: 1 } }),
          api.get('/admin/employees', { params: { is_active: true, page: 1, page_size: 1 } }),
          api.get('/admin/branches/report', { params: { page: 1, page_size: 1 } }),
          api.get('/loans', { params: { status: 'pending', page: 1, page_size: 1 } }),
        ]);

        const latestStats = trendRes[trendRes.length - 1]?.data || {};
        const trend = months.map((m, i) => ({
          label: m.label,
          value: Number(trendRes[i]?.data?.monthly_volume || 0),
        }));

        setStats({
          ...latestStats,
          active_users: activeUsersRes.data.total || 0,
          active_accounts: activeAccountsRes.data.total || 0,
          active_employees: activeEmployeesRes.data.total || 0,
          total_branches: branchesRes.data.total || 0,
          pending_loans: pendingLoansRes.data.total || 0,
          trend,
        });
      } catch (err) {
        setError(extractApiError(err, 'Failed to load dashboard'));
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) return <Spinner />;

  const s = stats || {};

  const volumeTrend = (() => {
    if (!s.trend || s.trend.length < 2) return null;
    const last = s.trend[s.trend.length - 1].value;
    const prev = s.trend[s.trend.length - 2].value;
    if (!prev) return null;
    return ((last - prev) / prev) * 100;
  })();

  const cards = [
    {
      icon: <DollarIcon />,
      iconVariant: 'primary',
      label: 'Monthly Volume',
      value: `Rs. ${formatCurrency(s.monthly_volume || 0)}`,
      trend: volumeTrend,
    },
    {
      icon: <UsersIcon />,
      iconVariant: 'success',
      label: 'Active Accounts',
      value: (s.active_accounts || 0).toLocaleString(),
    },
    {
      icon: <ActivityIcon />,
      iconVariant: 'warning',
      label: 'Active Users',
      value: (s.active_users || 0).toLocaleString(),
    },
    {
      icon: <BriefcaseIcon />,
      iconVariant: 'info',
      label: 'Active Employees',
      value: (s.active_employees || 0).toLocaleString(),
    },
  ];

  const lineData = s.trend || [];

  const donutTotal = (s.active_accounts || 0) + (s.pending_loans || 0) + (s.total_branches || 0);
  const donutSegments = [
    { label: 'Accounts', value: s.active_accounts || 0, color: 'var(--color-primary-500)' },
    { label: 'Pending Loans', value: s.pending_loans || 0, color: 'var(--color-warning)' },
    { label: 'Branches', value: s.total_branches || 0, color: 'var(--color-accent-teal)' },
  ];

  return (
    <div className="stack stack-lg">
      <div className="welcome-header">
        <p className="welcome-header__greeting">Welcome back</p>
        <h1 className="welcome-header__name">{user?.first_name} {user?.last_name}</h1>
      </div>

      <Alert type="danger" message={error} onClose={() => setError('')} />

      <div className="stat-grid">
        {cards.map((c) => (
          <article key={c.label} className="stat-card">
            <div className={`stat-card__icon stat-card__icon--${c.iconVariant}`}>{c.icon}</div>
            <div className="stat-card__content">
              <div className="stat-card__label">{c.label}</div>
              <div className="stat-card__value">{c.value}</div>
              {c.trend !== null && c.trend !== undefined && (
                <span className={`stat-card__trend stat-card__trend--${c.trend >= 0 ? 'up' : 'down'}`}>
                  {c.trend >= 0 ? '↑' : '↓'} {Math.abs(c.trend).toFixed(1)}%
                </span>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3 className="chart-card__title">Transaction Trends</h3>
          <MiniLineChart data={lineData} />
        </div>
        <div className="chart-card">
          <h3 className="chart-card__title">Distribution Overview</h3>
          <DonutChart segments={donutSegments} total={donutTotal} />
        </div>
      </div>

      <div className="chart-card">
        <h3 className="chart-card__title">System Summary</h3>
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div>
            <div className="stat-card__label">Total Branches</div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>{s.total_branches || 0}</div>
          </div>
          <div>
            <div className="stat-card__label">Pending Loans</div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>{s.pending_loans || 0}</div>
          </div>
          <div>
            <div className="stat-card__label">Active Users</div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>{s.active_users || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

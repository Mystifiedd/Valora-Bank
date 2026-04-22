import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { extractApiError } from '../../utils/format';

/* ── SVG icons ── */
const TxnIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
);
const VolumeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
);
const PeopleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
);
const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const InboxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-2 4H8l-2-4H2" /><path d="M5 6h14l3 6-3 6H5L2 12Z" /></svg>
);
const LoanIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 13l3-3 4 4 5-6" /></svg>
);
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
const UserPlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
);
const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
);
const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
);

/* ── Simple CSS bar chart ── */
function WeeklyBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div key={d.label} className="bar-chart__col">
          <div className="bar-chart__bar" style={{ height: `${(d.value / max) * 100}%` }} />
          <span className="bar-chart__label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [statsRes, ticketRes, requestRes] = await Promise.all([
          api.get('/employee/dashboard-stats'),
          api.get('/employee/tickets', { params: { include_unassigned: true, page: 1, page_size: 5 } }),
          api.get('/account-requests', { params: { status: 'pending', page: 1, page_size: 5 } }),
        ]);

        setStats(statsRes.data);
        setTickets(ticketRes.data.tickets || []);
        setRequests(requestRes.data.requests || []);
      } catch (err) {
        setError(extractApiError(err, 'Failed to load dashboard'));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <Spinner />;

  const s = stats || {};

  const statCards = [
    { icon: <TxnIcon />, iconVariant: 'primary', label: 'Open Tickets', value: s.open_tickets || 0 },
    { icon: <VolumeIcon />, iconVariant: 'success', label: 'Branch Users', value: s.branch_users || 0 },
    { icon: <PeopleIcon />, iconVariant: 'warning', label: 'Pending KYC', value: s.pending_kyc || 0 },
    { icon: <InboxIcon />, iconVariant: 'info', label: 'Pending Requests', value: s.pending_requests || 0 },
    { icon: <LoanIcon />, iconVariant: 'danger', label: 'Pending Loans', value: s.pending_loans || 0 },
    { icon: <ClockIcon />, iconVariant: 'secondary', label: 'Total Tickets', value: s.total_tickets || 0 },
  ];

  const quickActions = [
    { label: 'Account Requests', icon: <PlusIcon />, path: '/employee/account-requests' },
    { label: 'Branch Users', icon: <UserPlusIcon />, path: '/employee/branch-users' },
    { label: 'KYC Verification', icon: <FolderIcon />, path: '/employee/kyc' },
    { label: 'Support Tickets', icon: <FileIcon />, path: '/employee/tickets' },
    { label: 'Loan Management', icon: <LoanIcon />, path: '/employee/loans' },
  ];

  const weekData = s.weekly_activity || [];

  return (
    <div className="stack stack-lg">
      {/* Welcome */}
      <div className="welcome-header">
        <p className="welcome-header__greeting">Welcome back</p>
        <h1 className="welcome-header__name">{user.first_name} {user.last_name}</h1>
      </div>

      <Alert type="danger" message={error} onClose={() => setError('')} />

      {/* Stat cards */}
      <div className="stat-grid">
        {statCards.map((c) => (
          <article key={c.label} className="stat-card">
            <div className={`stat-card__icon stat-card__icon--${c.iconVariant}`}>{c.icon}</div>
            <div className="stat-card__content">
              <div className="stat-card__label">{c.label}</div>
              <div className="stat-card__value">{c.value}</div>
            </div>
          </article>
        ))}
      </div>

      {/* Chart + Quick Actions row */}
      <div className="chart-grid">
        <div className="chart-card">
          <h3 className="chart-card__title">This Week's Branch Activity</h3>
          <WeeklyBarChart data={weekData} />
        </div>
        <div className="chart-card">
          <h3 className="chart-card__title">Quick Actions</h3>
          <div className="quick-actions">
            {quickActions.map((a) => (
              <button
                key={a.label}
                type="button"
                className="quick-action-btn"
                onClick={() => navigate(a.path)}
              >
                <span className="quick-action-btn__icon">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Pending Account Requests */}
      <div className="table-card">
        <div className="table-card__header">
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>Pending Account Requests</h2>
          </div>
          <button type="button" className="button button-outline button-sm" onClick={() => navigate('/employee/account-requests')}>View All</button>
        </div>
        {requests.length === 0 ? (
          <p style={{ padding: 'var(--space-5)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No pending account requests.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Branch</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>{r.first_name} {r.last_name}</td>
                    <td className="text-capitalize">{r.account_type}</td>
                    <td>{r.branch_name}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Tickets */}
      <div className="table-card">
        <div className="table-card__header">
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>Recent Support Tickets</h2>
          </div>
          <button type="button" className="button button-outline button-sm" onClick={() => navigate('/employee/tickets')}>View All</button>
        </div>
        {tickets.length === 0 ? (
          <p style={{ padding: 'var(--space-5)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No support tickets.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Assigned</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.subject}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>{t.assigned_employee_id || <span style={{ color: 'var(--color-gray-400)' }}>Unassigned</span>}</td>
                    <td>{t.user_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

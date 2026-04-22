import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import Alert from '../../components/Alert';
import EmptyRow from '../../components/EmptyRow';
import { formatDate, extractApiError, formatCurrency } from '../../utils/format';
import { PAGE_SIZE } from '../../utils/constants';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [filters, setFilters] = useState({ user_id: '', action: '', table_name: '', start_date: '', end_date: '' });

  const fetchLogs = useCallback((p) => {
    setLoading(true);
    const params = { page: p, page_size: PAGE_SIZE };
    if (filters.user_id) params.user_id = filters.user_id;
    if (filters.action) params.action = filters.action;
    if (filters.table_name) params.table_name = filters.table_name;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    api.get('/admin/audit-logs', { params })
      .then((res) => { setLogs(res.data.logs || res.data.audit_logs || []); setTotal(res.data.total || 0); })
      .catch((err) => setError(extractApiError(err, 'Failed to load audit logs')))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchLogs(page); }, [page, fetchLogs]);

  const applyFilters = (e) => { e.preventDefault(); setPage(1); fetchLogs(1); };
  const clearFilters = () => { setFilters({ user_id: '', action: '', table_name: '', start_date: '', end_date: '' }); setPage(1); };

  const actionBadge = (action) => {
    const key = (action || '').toUpperCase();

    const metaMap = {
      TRANSACTIONS: { label: 'Transactions', color: 'primary' },
      DEPOSIT: { label: 'Deposit', color: 'success' },
      WITHDRAW: { label: 'Withdraw', color: 'warning' },
      WITHDRAWL: { label: 'Withdraw', color: 'warning' },
      OTHERS: { label: 'Others', color: 'neutral' }
    };

    const derived = (() => {
      if (['TRANSFER', 'VIEW_TRANSACTIONS'].includes(key)) return metaMap.TRANSACTIONS;
      if (['INSERT', 'UPDATE', 'DELETE', 'LOGIN'].includes(key)) return metaMap.OTHERS;
      if (metaMap[key]) return metaMap[key];
      return { label: key || '-', color: 'neutral' };
    })();

    return <span className={`badge badge--${derived.color}`}>{derived.label}</span>;
  };

  const handleUserIdChange = (event) => {
    const raw = event.target.value;
    if (raw === '') {
      setFilters({ ...filters, user_id: '' });
      return;
    }

    const parsed = Math.max(0, Math.trunc(Number(raw)));
    if (Number.isNaN(parsed)) {
      setFilters({ ...filters, user_id: '' });
      return;
    }

    setFilters({ ...filters, user_id: String(parsed) });
  };

  return (
    <div className="stack stack-lg">
      <div className="page-header">
        <h1 className="page-header__title">Audit Logs</h1>
      </div>
      <Alert type="danger" message={error} onClose={() => setError('')} />

      {/* Filters */}
      <div className="table-card" style={{ padding: 'var(--space-3) var(--space-4)' }}>
        <form className="filter-bar" onSubmit={applyFilters}>
          <div className="form-field">
            <label>User ID</label>
            <input type="number" min={0} step={1} className="input input--sm" style={{ width: 90 }} value={filters.user_id} onChange={handleUserIdChange} />
          </div>
          <div className="form-field">
            <label>Action</label>
            <select className="input input--sm" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })}>
              <option value="">All</option>
              <option value="TRANSACTIONS">Transactions</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAW">Withdraw</option>
              <option value="OTHERS">Others</option>
            </select>
          </div>
          <div className="form-field">
            <label>Table</label>
            <input type="text" className="input input--sm" placeholder="e.g. users" value={filters.table_name} onChange={(e) => setFilters({ ...filters, table_name: e.target.value })} />
          </div>
          <div className="form-field">
            <label>From</label>
            <input type="date" className="input input--sm" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} />
          </div>
          <div className="form-field">
            <label>To</label>
            <input type="date" className="input input--sm" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
            <button type="submit" className="button button-primary button-sm">Filter</button>
            <button type="button" className="button button-secondary button-sm" onClick={clearFilters}>Clear</button>
          </div>
        </form>
      </div>

      {loading ? <Spinner /> : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr><th>ID</th><th>User ID</th><th>Action</th><th>Table</th><th>Record ID</th><th>Details</th><th>Timestamp</th></tr>
              </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <EmptyRow colSpan={7} message="No audit logs found." />
                  ) : logs.map((l) => {
                    const amount = l.amount != null ? Number(l.amount) : null;
                    const display = amount != null && !Number.isNaN(amount) ? `Rs. ${formatCurrency(amount)}` : '-';

                    return (
                      <tr key={l.id}>
                        <td>{l.id}</td>
                        <td>{l.user_id || '-'}</td>
                        <td>{actionBadge(l.action)}</td>
                        <td className="font-mono text-small">{l.table_name}</td>
                        <td>{l.record_id || '-'}</td>
                        <td
                          className="small"
                          style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          title={display !== '-' ? display : undefined}
                        >
                          {display}
                        </td>
                        <td className="text-small">{formatDate(l.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        </div>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </div>
  );
}

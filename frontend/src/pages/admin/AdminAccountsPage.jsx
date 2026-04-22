import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';
import EmptyRow from '../../components/EmptyRow';
import { formatCurrency, formatDate, extractApiError } from '../../utils/format';
import { PAGE_SIZE } from '../../utils/constants';

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAccounts = useCallback((p) => {
    setLoading(true);
    const params = { page: p, page_size: PAGE_SIZE };
    if (typeFilter) params.account_type = typeFilter;
    if (statusFilter) params.status = statusFilter;
    api.get('/admin/accounts', { params })
      .then((res) => { setAccounts(res.data.accounts || []); setTotal(res.data.total || 0); })
      .catch((err) => setError(extractApiError(err, 'Failed to load accounts')))
      .finally(() => setLoading(false));
  }, [typeFilter, statusFilter]);

  useEffect(() => { fetchAccounts(page); }, [page, fetchAccounts]);

  return (
    <div className="stack stack-lg">
      <div className="page-header">
        <h1 className="page-header__title">All Accounts</h1>
      </div>
      <Alert type="danger" message={error} onClose={() => setError('')} />

      <div className="filter-bar">
        <select className="input input--sm" style={{ maxWidth: 160 }} value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="savings">Savings</option>
          <option value="checking">Checking</option>
          <option value="business">Business</option>
        </select>
        <select className="input input--sm" style={{ maxWidth: 160 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="frozen">Frozen</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? <Spinner /> : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr><th>ID</th><th>Account #</th><th>User ID</th><th>Type</th><th>Balance</th><th>Status</th><th>Opened</th></tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (
                  <EmptyRow colSpan={7} message="No accounts found." />
                ) : accounts.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td className="font-mono">{a.account_number}</td>
                    <td>{a.user_id}</td>
                    <td className="text-capitalize">{a.account_type}</td>
                    <td style={{ fontWeight: 600 }}>Rs. {formatCurrency(a.balance)}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>{formatDate(a.created_at, { includeTime: false })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </div>
  );
}

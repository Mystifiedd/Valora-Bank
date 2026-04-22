import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import { formatCurrency, extractApiError } from '../../utils/format';

export default function BranchManagementPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/branches/report')
      .then((res) => setBranches(res.data.reports || []))
      .catch((err) => setError(extractApiError(err, 'Failed to load branch report')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="stack stack-lg">
      <div className="page-header">
        <h1 className="page-header__title">Branch Management</h1>
      </div>
      <Alert type="danger" message={error} onClose={() => setError('')} />

      {branches.length === 0 ? (
        <p style={{ color: 'var(--color-gray-500)' }}>No branch data available.</p>
      ) : (
        <div className="branch-grid">
          {branches.map((b) => {
            const br = b.branch || b;
            return (
            <div className="branch-card" key={br.id || b.branch_id}>
              <h3 className="branch-card__title">{br.name || br.branch_name}</h3>
              <dl className="detail-list">
                <dt>Branch ID</dt><dd>{br.id || b.branch_id}</dd>
                <dt>Address</dt><dd>{br.address || '-'}</dd>
                <dt>City</dt><dd>{br.city || '-'}</dd>
                <dt>SWIFT Code</dt><dd className="font-mono">{br.SWIFT_code || '-'}</dd>
                <dt>Total Users</dt><dd>{b.total_users ?? '-'}</dd>
                <dt>Total Accounts</dt><dd>{b.total_accounts ?? '-'}</dd>
                <dt>Total Loans</dt><dd>{b.total_loans ?? '-'}</dd>
                <dt>Transactions</dt><dd>{b.total_transactions ?? '-'}</dd>
                <dt>Volume</dt><dd>{b.volume != null ? `Rs. ${formatCurrency(b.volume)}` : '-'}</dd>
              </dl>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';
import EmptyRow from '../../components/EmptyRow';
import { formatCurrency, formatDate, extractApiError } from '../../utils/format';
import { PAGE_SIZE } from '../../utils/constants';

export default function AdminLoansPage() {
  const [loans, setLoans] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Decision modal
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [acting, setActing] = useState(false);

  const fetchLoans = useCallback((p) => {
    setLoading(true);
    const params = { page: p, page_size: PAGE_SIZE };
    if (statusFilter) params.status = statusFilter;
    api.get('/loans', { params })
      .then((res) => { setLoans(res.data.loans || []); setTotal(res.data.total || 0); })
      .catch((err) => setError(extractApiError(err, 'Failed to load loans')))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchLoans(page); }, [page, fetchLoans]);

  const handleDecision = async (id, status) => {
    setActing(true);
    try {
      await api.patch(`/admin/loans/${id}/decision`, { status });
      setSuccess(`Loan #${id} ${status} successfully!`);
      setShowModal(false);
      setSelected(null);
      fetchLoans(page);
    } catch (err) {
      setError(extractApiError(err, `Failed to ${status} loan`));
    } finally { setActing(false); }
  };

  return (
    <div className="stack stack-lg">
      <div className="page-header">
        <h1 className="page-header__title">Loan Approvals</h1>
      </div>
      <Alert type="danger" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="filter-bar">
        <select className="input input--sm" style={{ maxWidth: 180 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="paid">Paid</option>
          <option value="defaulted">Defaulted</option>
        </select>
      </div>

      {loading ? <Spinner /> : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr><th>ID</th><th>User</th><th>Amount</th><th>Interest</th><th>Term</th><th>Status</th><th>Applied</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loans.length === 0 ? (
                  <EmptyRow colSpan={8} message="No loans found." />
                ) : loans.map((l) => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td>{l.user_id}</td>
                    <td style={{ fontWeight: 600 }}>Rs. {formatCurrency(l.principal_amount ?? l.amount)}</td>
                    <td>{l.interest_rate}%</td>
                    <td>{l.tenure_months ?? l.term_months} mo</td>
                    <td><StatusBadge status={l.status} colorMap={{ paid: 'info', defaulted: 'dark' }} /></td>
                    <td>{formatDate(l.created_at, { includeTime: false })}</td>
                    <td>
                      <button className="button button-outline button-sm" onClick={() => { setSelected(l); setShowModal(true); setSuccess(''); }}>
                        {l.status === 'pending' ? 'Review' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />

      <Modal show={showModal} title={`Loan #${selected?.id}`} onClose={() => { setShowModal(false); setSelected(null); }}>
        {selected && (
          <div>
            <dl className="detail-list">
              <dt>User ID</dt><dd>{selected.user_id}</dd>
              <dt>Amount</dt><dd>Rs. {formatCurrency(selected.principal_amount ?? selected.amount)}</dd>
              <dt>Interest Rate</dt><dd>{selected.interest_rate}%</dd>
              <dt>Term</dt><dd>{selected.tenure_months ?? selected.term_months} months</dd>
              <dt>Status</dt><dd><StatusBadge status={selected.status} colorMap={{ paid: 'info', defaulted: 'dark' }} /></dd>
              <dt>Purpose</dt><dd>{selected.purpose || '-'}</dd>
              <dt>Applied</dt><dd>{formatDate(selected.created_at)}</dd>
              {selected.approved_by && <><dt>Approved By</dt><dd>{selected.approved_by}</dd></>}
            </dl>
            {selected.status === 'pending' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                <button className="button button-danger" onClick={() => handleDecision(selected.id, 'rejected')} disabled={acting}>
                  {acting ? <span className="spinner spinner--sm" /> : 'Reject'}
                </button>
                <button className="button button-success" onClick={() => handleDecision(selected.id, 'approved')} disabled={acting}>
                  {acting ? <span className="spinner spinner--sm" /> : 'Approve'}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

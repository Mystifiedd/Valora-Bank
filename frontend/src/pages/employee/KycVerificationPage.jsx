import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';
import EmptyRow from '../../components/EmptyRow';
import { maskSensitive, formatDate, extractApiError } from '../../utils/format';
import { PAGE_SIZE } from '../../utils/constants';

export default function KycVerificationPage() {
  const [kycList, setKycList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Detail / action modal
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [acting, setActing] = useState(false);

  const fetchKyc = useCallback((p) => {
    setLoading(true);
    const params = { page: p, page_size: PAGE_SIZE };
    if (statusFilter) params.status = statusFilter;
    api.get('/kyc', { params })
      .then((res) => { setKycList(res.data.kyc || []); setTotal(res.data.total || 0); })
      .catch((err) => setError(extractApiError(err, 'Failed to load KYC records')))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchKyc(page); }, [page, fetchKyc]);

  const handleDecision = async (id, status) => {
    setActing(true);
    setError('');
    try {
      await api.patch(`/kyc/${id}/verify`, { status });
      setSuccess(`KYC #${id} ${status} successfully!`);
      setShowModal(false);
      setSelected(null);
      fetchKyc(page);
    } catch (err) {
      setError(extractApiError(err, `Failed to ${status} KYC`));
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="stack stack-lg">
      <div className="page-header">
        <h1 className="page-header__title">KYC Verification</h1>
      </div>
      <Alert type="danger" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="filter-bar">
        <select className="input input--sm" style={{ maxWidth: 180 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? <Spinner /> : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr><th>ID</th><th>User ID</th><th>Document Type</th><th>Document #</th><th>Status</th><th>Submitted</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {kycList.length === 0 ? (
                  <EmptyRow colSpan={7} message="No KYC records found." />
                ) : kycList.map((k) => (
                  <tr key={k.id}>
                    <td>{k.id}</td>
                    <td>{k.user_id}</td>
                    <td className="text-capitalize">{k.document_type}</td>
                    <td className="font-mono">{maskSensitive(k.document_number)}</td>
                    <td><StatusBadge status={k.status} /></td>
                    <td>{k.submitted_at ? formatDate(k.submitted_at, { includeTime: false }) : '-'}</td>
                    <td>
                      <button className="button button-secondary button-sm" onClick={() => { setSelected(k); setShowModal(true); setSuccess(''); }}>
                        {k.status === 'pending' ? 'Review' : 'View'}
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

      <Modal show={showModal} title={`KYC Review — #${selected?.id}`} onClose={() => { setShowModal(false); setSelected(null); }}>
        {selected && (
          <div>
            <dl className="detail-list">
              <dt>User ID</dt><dd>{selected.user_id}</dd>
              <dt>Document Type</dt><dd className="text-capitalize">{selected.document_type}</dd>
              <dt>Document Number</dt><dd className="font-mono">{maskSensitive(selected.document_number)}</dd>
              <dt>Status</dt><dd><StatusBadge status={selected.status} /></dd>
              <dt>Submitted</dt><dd>{selected.submitted_at ? formatDate(selected.submitted_at) : '-'}</dd>
              {selected.verified_by && <><dt>Verified By</dt><dd>{selected.verified_by}</dd></>}
            </dl>
            {selected.status === 'pending' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                <button className="button button-danger" onClick={() => handleDecision(selected.id, 'rejected')} disabled={acting}>
                  {acting ? <span className="spinner spinner--sm"></span> : 'Reject'}
                </button>
                <button className="button button-success" onClick={() => handleDecision(selected.id, 'verified')} disabled={acting}>
                  {acting ? <span className="spinner spinner--sm"></span> : 'Verify'}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

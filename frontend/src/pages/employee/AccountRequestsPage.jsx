import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';
import EmptyRow from '../../components/EmptyRow';
import ConfirmModal from '../../components/ConfirmModal';
import TableCard from '../../components/TableCard';
import { formatDate, extractApiError } from '../../utils/format';
import { PAGE_SIZE } from '../../utils/constants';

export default function AccountRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  // Detail modal
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [acting, setActing] = useState(false);

  // Confirm dialog
  const [confirmAction, setConfirmAction] = useState(null); // { id, decision, name }

  const fetchRequests = useCallback((p) => {
    setLoading(true);
    const params = { page: p, page_size: PAGE_SIZE };
    if (statusFilter) params.status = statusFilter;
    api.get('/account-requests', { params })
      .then((res) => { setRequests(res.data.requests || []); setTotal(res.data.total || 0); })
      .catch((err) => setError(extractApiError(err, 'Failed to load requests')))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchRequests(page); }, [page, fetchRequests]);

  const handleDecision = async () => {
    if (!confirmAction) return;
    setActing(true);
    try {
      const res = await api.patch(`/account-requests/${confirmAction.id}/review`, { decision: confirmAction.decision });
      const msg = confirmAction.decision === 'approved'
        ? `Request #${confirmAction.id} approved! Account ${res.data.account?.account_number || ''} created.`
        : `Request #${confirmAction.id} rejected.`;
      setSuccess(msg);
      setConfirmAction(null);
      setShowModal(false);
      fetchRequests(page);
    } catch (err) {
      setError(extractApiError(err, 'Failed to review request'));
    } finally {
      setActing(false);
    }
  };

  const openDetail = (r) => {
    setSelected(r);
    setShowModal(true);
    setSuccess('');
  };

  return (
    <div className="stack stack-lg">
      <div>
        <p className="heading-eyebrow mb-1">Operations</p>
        <h1 className="section-title mb-0">Account Requests</h1>
      </div>

      <Alert type="danger" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <Spinner />
      ) : (
        <>
          <TableCard
            eyebrow="Queue"
            title="Request Queue"
            description={total ? `${total} request${total === 1 ? '' : 's'} total` : 'Monitor and act on incoming openings'}
            actions={(
              <select
                className="input input--sm"
                style={{ minWidth: '160px' }}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
          >
            <table className="table-modern">
              <thead>
                <tr>
                  <th scope="col">Request</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Email</th>
                  <th scope="col">Type</th>
                  <th scope="col">Branch</th>
                  <th scope="col">Status</th>
                  <th scope="col">Account #</th>
                  <th scope="col">Submitted</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <EmptyRow colSpan={9} message="No account requests found." />
                ) : (
                  requests.map((r) => (
                    <tr key={r.id}>
                      <td>#{r.id}</td>
                      <td>{r.first_name} {r.last_name}</td>
                      <td>{r.email}</td>
                      <td className="text-capitalize">{r.account_type}</td>
                      <td>{r.branch_name}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td className="font-monospace small">{r.account_number || '-'}</td>
                      <td>{formatDate(r.created_at, { includeTime: false })}</td>
                      <td className="text-end">
                        {r.status === 'pending' ? (
                          <div className="inline-center" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="button button-primary button-sm"
                              onClick={() => setConfirmAction({ id: r.id, decision: 'approved', name: `${r.first_name} ${r.last_name}` })}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="button button-danger button-sm"
                              onClick={() => setConfirmAction({ id: r.id, decision: 'rejected', name: `${r.first_name} ${r.last_name}` })}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="button button-outline button-sm"
                            onClick={() => openDetail(r)}
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableCard>
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </>
      )}

      {/* Detail Modal */}
      <Modal show={showModal} title={`Request #${selected?.id}`} onClose={() => { setShowModal(false); setSelected(null); }}>
        {selected && (
          <dl className="detail-list">
            <dt>Customer</dt><dd>{selected.first_name} {selected.last_name}</dd>
            <dt>Email</dt><dd>{selected.email}</dd>
            <dt>Account Type</dt><dd className="text-capitalize">{selected.account_type}</dd>
            <dt>Branch</dt><dd>{selected.branch_name} ({selected.branch_city})</dd>
            <dt>Status</dt><dd><StatusBadge status={selected.status} /></dd>
            {selected.account_number && <><dt>Account #</dt><dd className="font-monospace">{selected.account_number}</dd></>}
            <dt>Submitted</dt><dd>{formatDate(selected.created_at)}</dd>
            {selected.reviewed_at && <><dt>Reviewed</dt><dd>{formatDate(selected.reviewed_at)}</dd></>}
          </dl>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmModal
        show={!!confirmAction}
        title={confirmAction?.decision === 'approved' ? 'Approve Account Request' : 'Reject Account Request'}
        message={confirmAction ? `${confirmAction.decision === 'approved' ? 'Approve' : 'Reject'} account request #${confirmAction.id} for ${confirmAction.name}?${confirmAction.decision === 'approved' ? ' The account will be created immediately.' : ''}` : ''}
        confirmText={confirmAction?.decision === 'approved' ? 'Approve' : 'Reject'}
        confirmVariant={confirmAction?.decision === 'approved' ? 'success' : 'danger'}
        loading={acting}
        onConfirm={handleDecision}
        onClose={() => setConfirmAction(null)}
      />
    </div>
  );
}

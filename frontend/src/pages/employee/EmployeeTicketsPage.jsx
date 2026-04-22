import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';
import EmptyRow from '../../components/EmptyRow';
import { formatDate, extractApiError } from '../../utils/format';
import { PAGE_SIZE } from '../../utils/constants';

export default function EmployeeTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showUnassigned, setShowUnassigned] = useState(true);

  // Detail modal
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [acting, setActing] = useState(false);

  const fetchTickets = useCallback((p) => {
    setLoading(true);
    const params = { page: p, page_size: PAGE_SIZE };
    if (statusFilter) params.status = statusFilter;
    if (showUnassigned) params.include_unassigned = true;
    api.get('/employee/tickets', { params })
      .then((res) => { setTickets(res.data.tickets || []); setTotal(res.data.total || 0); })
      .catch((err) => setError(extractApiError(err, 'Failed to load tickets')))
      .finally(() => setLoading(false));
  }, [statusFilter, showUnassigned]);

  useEffect(() => { fetchTickets(page); }, [page, fetchTickets]);

  const assignSelf = async (id) => {
    setActing(true);
    try {
      await api.patch(`/employee/tickets/${id}/assign-self`);
      setSuccess(`Ticket #${id} assigned to you!`);
      setShowModal(false);
      fetchTickets(page);
    } catch (err) {
      setError(extractApiError(err, 'Failed to assign ticket'));
    } finally { setActing(false); }
  };

  const updateStatus = async (id, status) => {
    setActing(true);
    try {
      await api.patch(`/employee/tickets/${id}/status`, { status });
      setSuccess(`Ticket #${id} updated to ${status.replace('_', ' ')}!`);
      setShowModal(false);
      fetchTickets(page);
    } catch (err) {
      setError(extractApiError(err, 'Failed to update status'));
    } finally { setActing(false); }
  };

  return (
    <div className="stack stack-lg">
      <div className="page-header">
        <h1 className="page-header__title">Support Management</h1>
      </div>
      <Alert type="danger" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="filter-bar">
        <select className="input input--sm" style={{ maxWidth: 180 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={showUnassigned} onChange={(e) => { setShowUnassigned(e.target.checked); setPage(1); }} />
          Show all tickets
        </label>
      </div>

      {loading ? <Spinner /> : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr><th>ID</th><th>Subject</th><th>User</th><th>Status</th><th>Assigned</th><th>Created</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <EmptyRow colSpan={7} message="No tickets found." />
                ) : tickets.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.subject}</td>
                    <td>{t.user_id}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>{t.assigned_employee_id || <span style={{ color: 'var(--color-gray-400)' }}>—</span>}</td>
                    <td>{formatDate(t.created_at, { includeTime: false })}</td>
                    <td>
                      <button className="button button-secondary button-sm" onClick={() => { setSelected(t); setShowModal(true); setSuccess(''); }}>Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />

      <Modal show={showModal} title={`Ticket #${selected?.id}`} onClose={() => { setShowModal(false); setSelected(null); }} size="lg">
        {selected && (
          <div>
            <dl className="detail-list">
              <dt>Subject</dt><dd>{selected.subject}</dd>
              <dt>User ID</dt><dd>{selected.user_id}</dd>
              <dt>Status</dt><dd><StatusBadge status={selected.status} /></dd>
              <dt>Assigned To</dt><dd>{selected.assigned_employee_id || 'Unassigned'}</dd>
              <dt>Created</dt><dd>{formatDate(selected.created_at)}</dd>
              <dt>Description</dt><dd>{selected.description}</dd>
            </dl>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-4)' }}>
              {!selected.assigned_employee_id && (
                <button className="button button-primary button-sm" onClick={() => assignSelf(selected.id)} disabled={acting}>Assign to Me</button>
              )}
              {selected.status === 'open' && (
                <button className="button button-warning button-sm" onClick={() => updateStatus(selected.id, 'in_progress')} disabled={acting}>Mark In Progress</button>
              )}
              {selected.status === 'in_progress' && (
                <button className="button button-success button-sm" onClick={() => updateStatus(selected.id, 'resolved')} disabled={acting}>Resolve</button>
              )}
              {selected.status !== 'closed' && (
                <button className="button button-secondary button-sm" onClick={() => updateStatus(selected.id, 'closed')} disabled={acting}>Close</button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

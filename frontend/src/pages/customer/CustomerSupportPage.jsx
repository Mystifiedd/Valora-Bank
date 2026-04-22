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

export default function CustomerSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = useCallback((p) => {
    setLoading(true);
    const params = { page: p, page_size: PAGE_SIZE };
    if (statusFilter) params.status = statusFilter;
    api.get('/support', { params })
      .then((res) => { setTickets(res.data.tickets || []); setTotal(res.data.total || 0); })
      .catch((err) => setError(extractApiError(err, 'Failed to load tickets')))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchTickets(page); }, [page, fetchTickets]);

  const validate = () => {
    const errs = {};
    if (!form.subject || form.subject.trim().length < 3) errs.subject = 'Subject must be at least 3 characters';
    if (!form.description || form.description.trim().length < 10) errs.description = 'Description must be at least 10 characters';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/support', { subject: form.subject.trim(), description: form.description.trim() });
      setSuccess('Support ticket created successfully!');
      setShowModal(false);
      setForm({ subject: '', description: '' });
      setFormErrors({});
      fetchTickets(page);
    } catch (err) {
      setError(extractApiError(err, 'Failed to create ticket'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stack stack-lg">
      <div className="page-header">
        <h1 className="page-header__title">Support Tickets</h1>
        <button className="button button-primary button-sm" onClick={() => { setShowModal(true); setSuccess(''); }}>+ New Ticket</button>
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
      </div>

      {loading ? <Spinner /> : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr><th>ID</th><th>Subject</th><th>Status</th><th>Created</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <EmptyRow colSpan={5} message="No tickets found." />
                ) : tickets.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.subject}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>{formatDate(t.created_at, { includeTime: false })}</td>
                    <td><button className="button button-secondary button-sm" onClick={() => { setSelectedTicket(t); setShowDetail(true); }}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />

      <Modal show={showModal} title="Create Support Ticket" onClose={() => { setShowModal(false); setFormErrors({}); }}>
        <form onSubmit={handleCreate} noValidate>
          <div className="stack">
            <div className="form-field">
              <label>Subject <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input type="text" className={`input${formErrors.subject ? ' input--error' : ''}`} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief description of your issue" />
              {formErrors.subject && <small style={{ color: 'var(--color-danger)' }}>{formErrors.subject}</small>}
            </div>
            <div className="form-field">
              <label>Description <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <textarea className={`input${formErrors.description ? ' input--error' : ''}`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Provide details about your issue..." />
              {formErrors.description && <small style={{ color: 'var(--color-danger)' }}>{formErrors.description}</small>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button type="button" className="button button-secondary" onClick={() => { setShowModal(false); setFormErrors({}); }}>Cancel</button>
              <button type="submit" className="button button-primary" disabled={submitting}>
                {submitting ? <><span className="spinner spinner--sm" style={{ marginRight: 'var(--space-1)' }}></span>Creating...</> : 'Submit Ticket'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal show={showDetail} title={`Ticket #${selectedTicket?.id}`} onClose={() => setShowDetail(false)} size="lg">
        {selectedTicket && (
          <dl className="detail-list">
            <dt>Subject</dt><dd>{selectedTicket.subject}</dd>
            <dt>Status</dt><dd><StatusBadge status={selectedTicket.status} /></dd>
            <dt>Created</dt><dd>{formatDate(selectedTicket.created_at)}</dd>
            <dt>Assigned To</dt><dd>{selectedTicket.assigned_employee_id || 'Unassigned'}</dd>
            <dt>Description</dt><dd>{selectedTicket.description}</dd>
          </dl>
        )}
      </Modal>
    </div>
  );
}

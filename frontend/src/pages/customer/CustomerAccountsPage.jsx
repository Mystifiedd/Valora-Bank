import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';
import EmptyRow from '../../components/EmptyRow';
import TableCard from '../../components/TableCard';
import { formatCurrency, formatDate, extractApiError } from '../../utils/format';
import { PAGE_SIZE } from '../../utils/constants';

export default function CustomerAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Requests tab
  const [requests, setRequests] = useState([]);
  const [reqTotal, setReqTotal] = useState(0);
  const [reqPage, setReqPage] = useState(1);
  const [reqLoading, setReqLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('accounts');

  // Create request modal
  const [showModal, setShowModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({ account_type: 'savings', branch_id: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchAccounts = useCallback((p) => {
    setLoading(true);
    api.get('/accounts', { params: { page: p, page_size: PAGE_SIZE } })
      .then((res) => { setAccounts(res.data.accounts || []); setTotal(res.data.total || 0); })
      .catch((err) => setError(extractApiError(err, 'Failed to load accounts')))
      .finally(() => setLoading(false));
  }, []);

  const fetchRequests = useCallback((p) => {
    setReqLoading(true);
    api.get('/account-requests', { params: { page: p, page_size: PAGE_SIZE } })
      .then((res) => { setRequests(res.data.requests || []); setReqTotal(res.data.total || 0); })
      .catch((err) => setError(extractApiError(err, 'Failed to load requests')))
      .finally(() => setReqLoading(false));
  }, []);

  useEffect(() => { fetchAccounts(page); }, [page, fetchAccounts]);
  useEffect(() => { if (activeTab === 'requests') fetchRequests(reqPage); }, [reqPage, activeTab, fetchRequests]);

  // Load branches when modal opens
  const openCreateModal = () => {
    setShowModal(true);
    setSuccess('');
    setForm({ account_type: 'savings', branch_id: '' });
    setFormErrors({});
    if (branches.length === 0) {
      api.get('/account-requests/branches')
        .then((res) => setBranches(res.data.branches || []))
        .catch(() => {});
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.account_type) errs.account_type = 'Account type is required';
    if (!form.branch_id) errs.branch_id = 'Please select a branch';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/account-requests', { account_type: form.account_type, branch_id: Number(form.branch_id) });
      setSuccess('Account request submitted! You will be notified once it is reviewed.');
      setShowModal(false);
      setForm({ account_type: 'savings', branch_id: '' });
      setFormErrors({});
      if (activeTab === 'requests') fetchRequests(reqPage);
    } catch (err) {
      setError(extractApiError(err, 'Failed to submit request'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stack stack-lg">
      <div className="inline-between">
        <div>
          <p className="heading-eyebrow mb-1">Accounts</p>
          <h1 className="section-title mb-0">My Accounts</h1>
        </div>
        <button type="button" className="button button-primary button-sm" onClick={openCreateModal}>
          + Request new account
        </button>
      </div>

      <Alert type="danger" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="segmented-control" role="tablist" aria-label="Account views">
        <button
          type="button"
          className={`segmented-control__option${activeTab === 'accounts' ? ' segmented-control__option--active' : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          Active Accounts
        </button>
        <button
          type="button"
          className={`segmented-control__option${activeTab === 'requests' ? ' segmented-control__option--active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          My Requests{reqTotal > 0 ? ` (${reqTotal})` : ''}
        </button>
      </div>

      {activeTab === 'accounts' && (
        <>
          {loading ? (
            <Spinner />
          ) : (
            <>
              <TableCard
                eyebrow="Portfolio"
                title="Active Accounts"
                description={total ? `Managing ${total} account${total === 1 ? '' : 's'}` : undefined}
              >
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th scope="col">Account #</th>
                      <th scope="col">Type</th>
                      <th scope="col">Balance</th>
                      <th scope="col">Status</th>
                      <th scope="col">Opened</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.length === 0 ? (
                      <EmptyRow colSpan={5} message="No accounts found. Request one to get started." />
                    ) : (
                      accounts.map((a) => (
                        <tr key={a.id}>
                          <td className="font-monospace small">{a.account_number}</td>
                          <td className="text-capitalize">{a.account_type}</td>
                          <td className="fw-semibold">Rs. {formatCurrency(a.balance)}</td>
                          <td><StatusBadge status={a.status} /></td>
                          <td>{formatDate(a.created_at, { includeTime: false })}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </TableCard>
              <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
            </>
          )}
        </>
      )}

      {activeTab === 'requests' && (
        <>
          {reqLoading ? (
            <Spinner />
          ) : (
            <>
              <TableCard
                eyebrow="Requests"
                title="Account Requests"
                description={reqTotal ? `${reqTotal} request${reqTotal === 1 ? '' : 's'} submitted` : 'Track progress on pending requests'}
              >
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th scope="col">Request</th>
                      <th scope="col">Type</th>
                      <th scope="col">Branch</th>
                      <th scope="col">Status</th>
                      <th scope="col">Account #</th>
                      <th scope="col">Submitted</th>
                      <th scope="col">Reviewed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <EmptyRow colSpan={7} message="No account requests yet." />
                    ) : (
                      requests.map((r) => (
                        <tr key={r.id}>
                          <td>#{r.id}</td>
                          <td className="text-capitalize">{r.account_type}</td>
                          <td>{r.branch_name} ({r.branch_city})</td>
                          <td><StatusBadge status={r.status} /></td>
                          <td className="font-monospace small">{r.account_number || '-'}</td>
                          <td>{formatDate(r.created_at, { includeTime: false })}</td>
                          <td>{r.reviewed_at ? formatDate(r.reviewed_at, { includeTime: false }) : '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </TableCard>
              <Pagination page={reqPage} pageSize={PAGE_SIZE} total={reqTotal} onPageChange={setReqPage} />
            </>
          )}
        </>
      )}

      {/* Request New Account Modal */}
      <Modal show={showModal} title="Request New Account" onClose={() => { setShowModal(false); setFormErrors({}); }}>
        <form onSubmit={handleCreate} noValidate>
          <div className="stack">
            <div className="form-field">
              <label>Account Type <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <select className={`input${formErrors.account_type ? ' input--error' : ''}`} value={form.account_type} onChange={(e) => setForm({ ...form, account_type: e.target.value })}>
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="fixed">Fixed Deposit</option>
              </select>
              {formErrors.account_type && <small style={{ color: 'var(--color-danger)' }}>{formErrors.account_type}</small>}
            </div>
            <div className="form-field">
              <label>Branch <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <select
                className={`input${formErrors.branch_id ? ' input--error' : ''}`}
                value={form.branch_id}
                onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                size={Math.min(branches.length + 1, 6)}
                style={{ overflowY: 'auto' }}
              >
                <option value="">-- Select Branch --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} — {b.city}, {b.state}</option>
                ))}
              </select>
              {formErrors.branch_id && <small style={{ color: 'var(--color-danger)' }}>{formErrors.branch_id}</small>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button type="button" className="button button-secondary" onClick={() => { setShowModal(false); setFormErrors({}); }}>Cancel</button>
              <button type="submit" className="button button-primary" disabled={submitting}>
                {submitting ? <><span className="spinner spinner--sm" style={{ marginRight: 'var(--space-1)' }}></span>Submitting...</> : 'Submit Request'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

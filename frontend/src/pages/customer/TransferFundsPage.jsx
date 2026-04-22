import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';
import ConfirmModal from '../../components/ConfirmModal';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, extractApiError } from '../../utils/format';

export default function TransferFundsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({ from_account_id: '', to_account_number: '', amount: '' });
  const [recentTransfers, setRecentTransfers] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    api.get('/accounts', { params: { page: 1, page_size: 100 } })
      .then((res) => {
        const accs = (res.data.accounts || []).filter((a) => a.status === 'active');
        setAccounts(accs);
        if (accs.length > 0) setForm((f) => ({ ...f, from_account_id: String(accs[0].id) }));
      })
      .catch((err) => setError(extractApiError(err, 'Failed to load accounts')))
      .finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.from_account_id) errs.from_account_id = 'Select source account';
    if (!form.to_account_number || form.to_account_number.trim().length < 10) errs.to_account_number = 'Enter valid account number (min 10 digits)';
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (form.from_account_id === form.to_account_number) errs.to_account_number = 'Cannot transfer to the same account';
    const srcAccount = accounts.find((a) => String(a.id) === form.from_account_id);
    if (srcAccount && Number(form.amount) > Number(srcAccount.balance)) errs.amount = 'Insufficient balance';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleTransfer = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;
    // Show confirmation step before executing
    if (!showConfirm) { setShowConfirm(true); return; }
    setShowConfirm(false);
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/transfers', {
        from_account_id: Number(form.from_account_id),
        to_account_number: form.to_account_number.trim(),
        amount: Number(form.amount),
      });
      setSuccess(`Transfer of Rs. ${formatCurrency(form.amount)} completed! Ref: ${res.data.reference || ''}`);
      setRecentTransfers((prev) => [{ ...res.data, _time: new Date().toLocaleString() }, ...prev].slice(0, 10));
      setShowModal(false);
      setForm((f) => ({ ...f, to_account_number: '', amount: '' }));
      setFormErrors({});
      // refresh accounts for updated balance
      const accRes = await api.get('/accounts', { params: { page: 1, page_size: 100 } });
      setAccounts((accRes.data.accounts || []).filter((a) => a.status === 'active'));
    } catch (err) {
      setError(extractApiError(err, 'Transfer failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const fromAccount = accounts.find((a) => String(a.id) === form.from_account_id);

  if (loading) return <Spinner />;

  return (
    <div className="stack stack-lg">
      <div className="page-header">
        <h1 className="page-header__title">Transfer Funds</h1>
        <button className="button button-primary" onClick={() => { setShowModal(true); setSuccess(''); setError(''); }}>
          + New Transfer
        </button>
      </div>

      <Alert type="danger" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Account balances */}
      <div className="branch-grid">
        {accounts.map((a) => (
          <div className="branch-card" key={a.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.875rem' }}>{a.account_number}</span>
              <span className="badge badge--success">{a.status}</span>
            </div>
            <div className="text-capitalize" style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>{a.account_type}</div>
            <h5 style={{ marginTop: 'var(--space-2)', marginBottom: 0, color: 'var(--color-primary-600)', fontWeight: 600 }}>Rs. {formatCurrency(a.balance)}</h5>
          </div>
        ))}
      </div>

      {/* Recent transfers */}
      {recentTransfers.length > 0 && (
        <div className="table-card">
          <div className="table-card__header">
            <h3 className="table-card__title">Recent Transfers (this session)</h3>
          </div>
          <div className="table-responsive">
            <table className="table-modern">
              <thead><tr><th>From</th><th>To</th><th>Amount</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                {recentTransfers.map((t, i) => (
                  <tr key={i}>
                    <td>{t.from_account_number || t.from_account_id}</td><td>{t.to_account_number || t.to_account_id}</td>
                    <td style={{ fontWeight: 600 }}>Rs. {formatCurrency(t.amount)}</td>
                    <td><StatusBadge status={t.status || 'completed'} colorMap={{ completed: 'success' }} /></td>
                    <td style={{ fontSize: '0.875rem' }}>{t._time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      <Modal show={showModal} title="New Fund Transfer" onClose={() => { setShowModal(false); setFormErrors({}); }}>
        <form onSubmit={handleTransfer} noValidate>
          <div className="stack">
            <div className="form-field">
              <label>From Account <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <select
                className={`input${formErrors.from_account_id ? ' input--error' : ''}`}
                value={form.from_account_id}
                onChange={(e) => setForm({ ...form, from_account_id: e.target.value })}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.account_number} — Rs. {formatCurrency(a.balance)}</option>
                ))}
              </select>
              {formErrors.from_account_id && <small style={{ color: 'var(--color-danger)' }}>{formErrors.from_account_id}</small>}
              {fromAccount && <small style={{ color: 'var(--color-gray-500)' }}>Available: Rs. {formatCurrency(fromAccount.balance)}</small>}
            </div>
            <div className="form-field">
              <label>To Account Number <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input
                type="text"
                className={`input${formErrors.to_account_number ? ' input--error' : ''}`}
                value={form.to_account_number}
                onChange={(e) => setForm({ ...form, to_account_number: e.target.value })}
                placeholder="Enter recipient's account number"
                minLength={10}
                maxLength={20}
              />
              {formErrors.to_account_number && <small style={{ color: 'var(--color-danger)' }}>{formErrors.to_account_number}</small>}
            </div>
            <div className="form-field">
              <label>Amount (Rs.) <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input
                type="number"
                className={`input${formErrors.amount ? ' input--error' : ''}`}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                min={0.01}
                step="0.01"
              />
              {formErrors.amount && <small style={{ color: 'var(--color-danger)' }}>{formErrors.amount}</small>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button type="button" className="button button-secondary" onClick={() => { setShowModal(false); setFormErrors({}); }}>Cancel</button>
              <button type="submit" className="button button-primary" disabled={submitting}>
                {submitting ? <><span className="spinner spinner--sm" style={{ marginRight: 'var(--space-1)' }}></span>Transferring...</> : 'Transfer'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        show={showConfirm}
        title="Confirm Transfer"
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleTransfer}
        loading={submitting}
        confirmText="Confirm Transfer"
        confirmVariant="primary"
      >
        <p>Transfer <strong>Rs. {formatCurrency(form.amount)}</strong> from account <strong>{fromAccount?.account_number}</strong> to account <strong>{form.to_account_number}</strong>?</p>
      </ConfirmModal>
    </div>
  );
}

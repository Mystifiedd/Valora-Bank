import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';
import EmptyRow from '../../components/EmptyRow';
import { formatCurrency, extractApiError } from '../../utils/format';
import { PAGE_SIZE } from '../../utils/constants';

const INTEREST_RATES = {
  personal: 10.5,
  home: 8.5,
  auto: 9.0,
  education: 7.5,
  business: 11.0
};

export default function CustomerLoansPage() {
  const [loans, setLoans] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ loan_type: 'personal', principal_amount: '', tenure_months: '12' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [showPay, setShowPay] = useState(false);
  const [payLoan, setPayLoan] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payError, setPayError] = useState('');
  const [paying, setPaying] = useState(false);

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

  const validate = () => {
    const errs = {};
    const amount = parseFloat(form.principal_amount);
    const months = parseInt(form.tenure_months, 10);
    if (!form.principal_amount || isNaN(amount) || amount < 100) errs.principal_amount = 'Minimum Rs. 100';
    if (!form.tenure_months || isNaN(months) || months < 1) errs.tenure_months = 'Minimum 1 month';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/loans/apply', {
        loan_type: form.loan_type,
        principal_amount: String(form.principal_amount),
        tenure_months: String(form.tenure_months),
      });
      setSuccess('Loan application submitted successfully!');
      setShowApply(false);
      setForm({ loan_type: 'personal', principal_amount: '', tenure_months: '12' });
      setFormErrors({});
      fetchLoans(page);
    } catch (err) {
      setError(extractApiError(err, 'Loan application failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) { setPayError('Enter a valid amount'); return; }
    setPaying(true);
    setPayError('');
    try {
      await api.post(`/loans/${payLoan.id}/payments`, { amount_paid: Number(payAmount) });
      setSuccess(`Payment of Rs. ${Number(payAmount).toLocaleString()} recorded!`);
      setShowPay(false);
      setPayLoan(null);
      setPayAmount('');
      fetchLoans(page);
    } catch (err) {
      setPayError(extractApiError(err, 'Payment failed'));
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="stack stack-lg">
      <div className="page-header">
        <h1 className="page-header__title">My Loans</h1>
        <button className="button button-primary button-sm" onClick={() => { setShowApply(true); setSuccess(''); }}>+ Apply for Loan</button>
      </div>

      <Alert type="danger" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="filter-bar">
        <select className="input input--sm" style={{ maxWidth: 180 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? <Spinner /> : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr><th>ID</th><th>Type</th><th>Principal</th><th>Rate</th><th>Tenure</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loans.length === 0 ? (
                  <EmptyRow colSpan={7} message="No loans found." />
                ) : loans.map((l) => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td className="text-capitalize">{l.loan_type}</td>
                    <td>Rs. {formatCurrency(l.principal_amount)}</td>
                    <td>{l.interest_rate}%</td>
                    <td>{l.tenure_months} mo</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td>
                      {l.status === 'approved' && (
                        <button className="button button-success button-sm" onClick={() => { setPayLoan(l); setShowPay(true); setSuccess(''); }}>Make Payment</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />

      <Modal show={showApply} title="Apply for Loan" onClose={() => { setShowApply(false); setFormErrors({}); }}>
        <form onSubmit={handleApply} noValidate>
          <div className="stack">
            <div className="form-field">
              <label>Loan Type <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <select className="input" value={form.loan_type} onChange={(e) => setForm({ ...form, loan_type: e.target.value })}>
                <option value="personal">Personal</option>
                <option value="home">Home</option>
                <option value="auto">Auto</option>
                <option value="education">Education</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div className="form-field">
              <label>Principal Amount (Rs.) <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input type="number" className={`input${formErrors.principal_amount ? ' input--error' : ''}`} value={form.principal_amount} onChange={(e) => setForm({ ...form, principal_amount: e.target.value })} min={100} placeholder="Min Rs. 100" />
              {formErrors.principal_amount && <small style={{ color: 'var(--color-danger)' }}>{formErrors.principal_amount}</small>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="form-field">
                <label>Tenure (months) <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input type="number" className={`input${formErrors.tenure_months ? ' input--error' : ''}`} value={form.tenure_months} onChange={(e) => setForm({ ...form, tenure_months: e.target.value })} min={1} />
                {formErrors.tenure_months && <small style={{ color: 'var(--color-danger)' }}>{formErrors.tenure_months}</small>}
              </div>
              <div className="form-field">
                <label>Interest Rate</label>
                <input
                  type="text"
                  className="input"
                  value={`${INTEREST_RATES[form.loan_type] ?? 10.5}%`}
                  readOnly
                  disabled
                  style={{ background: 'var(--color-surface-alt, #f5f5f5)', cursor: 'default', fontWeight: 600 }}
                />
                <small className="text-muted">Standard rate for {form.loan_type} loan</small>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button type="button" className="button button-secondary" onClick={() => { setShowApply(false); setFormErrors({}); }}>Cancel</button>
              <button type="submit" className="button button-primary" disabled={submitting}>
                {submitting ? <><span className="spinner spinner--sm" style={{ marginRight: 'var(--space-1)' }}></span>Submitting...</> : 'Apply'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal show={showPay} title={`Payment — Loan #${payLoan?.id}`} onClose={() => { setShowPay(false); setPayError(''); }}>
        <form onSubmit={handlePayment} noValidate>
          {payError && <div className="alert-banner alert-banner--danger">{payError}</div>}
          <p style={{ marginBottom: 'var(--space-2)' }}>Principal: <strong>Rs. {Number(payLoan?.principal_amount || 0).toLocaleString()}</strong> | Rate: {payLoan?.interest_rate}% | {payLoan?.tenure_months} months</p>
          <div className="form-field">
            <label>Payment Amount (Rs.) <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <input type="number" className="input" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} min={0.01} step="0.01" placeholder="0.00" required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            <button type="button" className="button button-secondary" onClick={() => { setShowPay(false); setPayError(''); }}>Cancel</button>
            <button type="submit" className="button button-success" disabled={paying}>
              {paying ? <><span className="spinner spinner--sm" style={{ marginRight: 'var(--space-1)' }}></span>Processing...</> : 'Pay'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

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

export default function CustomerKycPage() {
  const [kycList, setKycList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Submit modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ document_type: 'passport', document_number: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchKyc = useCallback((p) => {
    setLoading(true);
    api.get('/kyc', { params: { page: p, page_size: PAGE_SIZE } })
      .then((res) => { setKycList(res.data.kyc || []); setTotal(res.data.total || 0); })
      .catch((err) => setError(extractApiError(err, 'Failed to load KYC records')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchKyc(page); }, [page, fetchKyc]);

  const validate = () => {
    const errs = {};
    if (!form.document_type) errs.document_type = 'Select a document type';
    if (!form.document_number || form.document_number.trim().length < 3) errs.document_number = 'Enter a valid document number (min 3 chars)';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/kyc', {
        document_type: form.document_type,
        document_number: form.document_number.trim(),
      });
      setSuccess('KYC document submitted for verification!');
      setShowModal(false);
      setForm({ document_type: 'passport', document_number: '' });
      setFormErrors({});
      fetchKyc(page);
    } catch (err) {
      setError(extractApiError(err, 'KYC submission failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stack stack-lg">
      <div className="page-header">
        <h1 className="page-header__title">KYC Verification</h1>
        <button className="button button-primary button-sm" onClick={() => { setShowModal(true); setSuccess(''); }}>+ Submit KYC</button>
      </div>

      <Alert type="danger" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? <Spinner /> : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr><th>ID</th><th>Document Type</th><th>Document Number</th><th>Status</th><th>Submitted</th><th>Verified By</th></tr>
              </thead>
              <tbody>
                {kycList.length === 0 ? (
                  <EmptyRow colSpan={6} message="No KYC submissions yet." />
                ) : kycList.map((k) => (
                  <tr key={k.id}>
                    <td>{k.id}</td>
                    <td className="text-capitalize">{k.document_type}</td>
                    <td className="font-mono">{maskSensitive(k.document_number)}</td>
                    <td><StatusBadge status={k.status} /></td>
                    <td>{formatDate(k.submitted_at, { includeTime: false })}</td>
                    <td>{k.verified_by || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />

      {/* Submit KYC Modal */}
      <Modal show={showModal} title="Submit KYC Document" onClose={() => { setShowModal(false); setFormErrors({}); }}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="stack">
            <div className="form-field">
              <label>Document Type <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <select
                className={`input${formErrors.document_type ? ' input--error' : ''}`}
                value={form.document_type}
                onChange={(e) => setForm({ ...form, document_type: e.target.value })}
              >
                <option value="passport">Passport</option>
                <option value="driving_license">Driving License</option>
                <option value="national_id">National ID</option>
                <option value="voter_id">Voter ID</option>
                <option value="aadhaar">Aadhaar</option>
              </select>
              {formErrors.document_type && <small style={{ color: 'var(--color-danger)' }}>{formErrors.document_type}</small>}
            </div>
            <div className="form-field">
              <label>Document Number <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input
                type="text"
                className={`input${formErrors.document_number ? ' input--error' : ''}`}
                value={form.document_number}
                onChange={(e) => setForm({ ...form, document_number: e.target.value })}
                placeholder="e.g., AB1234567"
              />
              {formErrors.document_number && <small style={{ color: 'var(--color-danger)' }}>{formErrors.document_number}</small>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button type="button" className="button button-secondary" onClick={() => { setShowModal(false); setFormErrors({}); }}>Cancel</button>
              <button type="submit" className="button button-primary" disabled={submitting}>
                {submitting ? <><span className="spinner spinner--sm" style={{ marginRight: 'var(--space-1)' }}></span>Submitting...</> : 'Submit KYC'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

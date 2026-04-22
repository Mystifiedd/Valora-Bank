import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import ActiveBadge from '../../components/ActiveBadge';
import EmptyRow from '../../components/EmptyRow';
import { formatDate, formatCurrency, extractApiError } from '../../utils/format';
import { PAGE_SIZE } from '../../utils/constants';

export default function BranchUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [success, setSuccess] = useState('');

  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [userAccounts, setUserAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAccount, setDepositAccount] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  const fetchUsers = useCallback((p) => {
    setLoading(true);
    const params = { page: p, page_size: PAGE_SIZE };
    if (roleFilter) params.role = roleFilter;
    if (activeFilter !== '') params.is_active = activeFilter;
    api.get('/employee/branch-users', { params })
      .then((res) => {
        setUsers(res.data.users || []);
        setTotal(res.data.total || 0);
      })
      .catch((err) => setError(extractApiError(err, 'Failed to load branch users')))
      .finally(() => setLoading(false));
  }, [roleFilter, activeFilter]);

  useEffect(() => { fetchUsers(page); }, [page, fetchUsers]);

  const resetDepositState = useCallback(() => {
    setShowDeposit(false);
    setDepositAccount(null);
    setDepositAmount('');
    setDepositError('');
  }, []);

  const loadUserAccounts = useCallback(async (userId) => {
    setLoadingAccounts(true);
    try {
      const res = await api.get('/accounts', { params: { user_id: userId, page: 1, page_size: 100 } });
      setUserAccounts(res.data.accounts || []);
    } catch (err) {
      setUserAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  const openUserDetail = async (user) => {
    setSelected(user);
    setShowDetail(true);
    setSuccess('');
    resetDepositState();
    if (user.role === 'Customer') {
      await loadUserAccounts(user.id);
    } else {
      setUserAccounts([]);
    }
  };

  const closeUserDetail = () => {
    setShowDetail(false);
    setSelected(null);
    setUserAccounts([]);
    resetDepositState();
  };

  const openDepositModal = (account) => {
    setDepositAccount(account);
    setDepositAmount('');
    setDepositError('');
    setShowDeposit(true);
  };

  const handleDeposit = async () => {
    if (!depositAccount) return;
    const amountValue = Number(depositAmount);
    if (!depositAmount || Number.isNaN(amountValue) || amountValue <= 0) {
      setDepositError('Enter an amount greater than zero.');
      return;
    }

    setDepositLoading(true);
    setDepositError('');
    try {
      await api.post('/transactions/deposit', {
        account_id: depositAccount.id,
        amount: amountValue
      });
      setSuccess(`Rs. ${formatCurrency(amountValue)} added to account ${depositAccount.account_number}.`);
      resetDepositState();
      if (selected?.id) {
        await loadUserAccounts(selected.id);
      }
    } catch (err) {
      setDepositError(extractApiError(err, 'Failed to add funds'));
    } finally {
      setDepositLoading(false);
    }
  };

  return (
    <div className="stack stack-lg">
      <div className="page-header">
        <h1 className="page-header__title">Branch Users</h1>
      </div>
      <Alert type="danger" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="filter-bar">
        <select
          className="input input--sm"
          style={{ maxWidth: 160 }}
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Roles</option>
          <option value="Customer">Customer</option>
          <option value="Employee">Employee</option>
        </select>
        <select
          className="input input--sm"
          style={{ maxWidth: 160 }}
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <EmptyRow colSpan={8} message="No users found." />
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.first_name} {u.last_name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td><span className="badge badge--neutral">{u.role || '-'}</span></td>
                      <td><ActiveBadge isActive={u.is_active} /></td>
                      <td>{formatDate(u.created_at, { includeTime: false })}</td>
                      <td>
                        <button className="button button-secondary button-sm" onClick={() => openUserDetail(u)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />

      <Modal show={showDetail} title={`User #${selected?.id}`} onClose={closeUserDetail}>
        {selected && (
          <div>
            <dl className="detail-list">
              <dt>Name</dt><dd>{selected.first_name} {selected.last_name}</dd>
              <dt>Email</dt><dd>{selected.email}</dd>
              <dt>Phone</dt><dd>{selected.phone || '-'}</dd>
              <dt>Role</dt><dd>{selected.role || '-'}</dd>
              <dt>Branch</dt>
              <dd>{selected.branch_id ? `${selected.branch_id} — ${selected.branch_name || 'Unknown branch'}` : '-'}</dd>
              <dt>Status</dt><dd><ActiveBadge isActive={selected.is_active} /></dd>
              <dt>Joined</dt><dd>{formatDate(selected.created_at)}</dd>
            </dl>
            {selected.role === 'Customer' && (
              <>
                <h6 style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>Account Numbers</h6>
                {loadingAccounts ? (
                  <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>Loading accounts...</p>
                ) : userAccounts.length === 0 ? (
                  <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>No accounts found.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {userAccounts.map((acc) => (
                      <li key={acc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', padding: 'var(--space-2) 0' }}>
                        <div className="font-mono" style={{ fontSize: '0.875rem' }}>
                          {acc.account_number}
                          <span style={{ color: 'var(--color-gray-500)' }}> ({acc.account_type}, Rs. {formatCurrency(acc.balance)})</span>
                        </div>
                        <button
                          type="button"
                          className="button button-success button-sm"
                          onClick={() => openDepositModal(acc)}
                        >
                          Add Funds
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        show={showDeposit}
        title={depositAccount ? `Add Funds — ${depositAccount.account_number}` : 'Add Funds'}
        onClose={() => {
          if (depositLoading) return;
          resetDepositState();
        }}
        footer={(
          <>
            <button className="button button-secondary" onClick={resetDepositState} disabled={depositLoading}>
              Cancel
            </button>
            <button className="button button-primary" onClick={handleDeposit} disabled={depositLoading}>
              {depositLoading ? <span className="spinner spinner--sm" /> : 'Confirm Deposit'}
            </button>
          </>
        )}
      >
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: 'var(--space-3)' }}>Use this form to record customer deposits handled at the branch.</p>
          <div className="form-field">
            <label>Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              disabled={depositLoading}
            />
          </div>
          {depositError && <div className="alert-banner alert-banner--danger" role="alert">{depositError}</div>}
        </div>
      </Modal>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import Alert from '../../components/Alert';
import EmptyRow from '../../components/EmptyRow';
import TableCard from '../../components/TableCard';
import { formatCurrency, formatDate, extractApiError, getTransactionTone } from '../../utils/format';
import { PAGE_SIZE } from '../../utils/constants';

export default function CustomerTransactionsPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ type: '', start_date: '', end_date: '' });

  const [txError, setTxError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/accounts', { params: { page: 1, page_size: 100 } })
      .then((res) => {
        const accs = res.data.accounts || [];
        setAccounts(accs);
        if (accs.length > 0) setSelectedAccount(String(accs[0].id));
      })
      .catch((err) => setError(extractApiError(err, 'Failed to load accounts')))
      .finally(() => setLoading(false));
  }, []);

  const fetchTransactions = useCallback(() => {
    if (!selectedAccount) return;
    setLoading(true);
    const params = { account_id: selectedAccount, page, page_size: PAGE_SIZE };
    if (filters.type) params.type = filters.type;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    api.get('/transactions', { params })
      .then((res) => { setTransactions(res.data.transactions || []); setTotal(res.data.total || 0); })
      .catch((err) => setError(extractApiError(err, 'Failed to load transactions')))
      .finally(() => setLoading(false));
  }, [selectedAccount, page, filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const currentAccount = accounts.find((a) => String(a.id) === selectedAccount);

  return (
    <div className="stack stack-lg">
      <div>
        <p className="heading-eyebrow mb-1">Transactions</p>
        <h1 className="section-title mb-0">Transaction History</h1>
      </div>

      <Alert type="danger" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="card-surface stack">
        <div className="inline-between" style={{ gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '240px' }}>
            <label className="heading-eyebrow d-block mb-1" htmlFor="account-select">Account</label>
            <select
              id="account-select"
              className="input"
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setPage(1);
              }}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_number} ({a.account_type})
                </option>
              ))}
            </select>
          </div>

          {currentAccount && (
            <div className="card-muted" style={{ minWidth: '200px' }}>
              <p className="heading-eyebrow mb-1">Available balance</p>
              <strong className="section-title" style={{ fontSize: '1.5rem' }}>
                Rs. {formatCurrency(currentAccount.balance)}
              </strong>
            </div>
          )}

          <div className="card-muted" style={{ minWidth: '200px' }}>
            <p className="heading-eyebrow mb-1">Note</p>
            <small className="text-muted">Deposits and withdrawals must be processed by a bank employee or admin.</small>
          </div>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <TableCard
            eyebrow="History"
            title="Transactions"
            description={total ? `${total} transaction${total === 1 ? '' : 's'} found` : undefined}
            actions={(
              <div className="table-card__controls">
                <select
                  className="input input--sm"
                  value={filters.type}
                  onChange={(e) => {
                    setFilters({ ...filters, type: e.target.value });
                    setPage(1);
                  }}
                >
                  <option value="">All types</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
                <input
                  type="date"
                  className="input input--sm"
                  value={filters.start_date}
                  onChange={(e) => {
                    setFilters({ ...filters, start_date: e.target.value });
                    setPage(1);
                  }}
                />
                <input
                  type="date"
                  className="input input--sm"
                  value={filters.end_date}
                  onChange={(e) => {
                    setFilters({ ...filters, end_date: e.target.value });
                    setPage(1);
                  }}
                />
                <button
                  type="button"
                  className="button button-subtle button-sm"
                  onClick={() => {
                    setFilters({ type: '', start_date: '', end_date: '' });
                    setPage(1);
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          >
            <table className="table-modern">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Type</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Reference</th>
                  <th scope="col">Description</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <EmptyRow colSpan={6} message="No transactions found." />
                ) : (
                  transactions.map((t) => {
                    const meta = getTransactionTone(t.type);
                    const toneClass = meta.tone ? `text-${meta.tone}` : '';
                    const typeClass = ['fw-semibold', toneClass || 'text-body'].filter(Boolean).join(' ');
                    const amountClass = ['fw-semibold', toneClass].filter(Boolean).join(' ');

                    return (
                      <tr key={t.id}>
                        <td>#{t.id}</td>
                        <td className={typeClass}>{meta.label}</td>
                        <td className={amountClass}>
                          {meta.sign}Rs. {formatCurrency(t.amount)}
                        </td>
                        <td className="font-monospace small">{t.reference_number || '-'}</td>
                        <td>{t.description || '-'}</td>
                        <td>{formatDate(t.created_at)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </TableCard>
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

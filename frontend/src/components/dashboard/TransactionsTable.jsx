import { useState, useMemo } from 'react';
import { formatCurrency, formatDate, getTransactionTone } from '../../utils/format';

export default function TransactionsTable({ transactions = [], onViewAll }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      (tx) =>
        (tx.description || '').toLowerCase().includes(q) ||
        (tx.reference_number || '').toLowerCase().includes(q)
    );
  }, [transactions, search]);

  return (
    <div className="txn-table-card">
      <div className="txn-table-card__header">
        <h3 className="txn-table-card__title">Recent transactions</h3>

        <div className="txn-table-card__controls">
          {/* Search */}
          <div className="txn-table-card__search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search transactions"
            />
          </div>

          {/* Filter dropdown (presentational) */}
          <button type="button" className="txn-table-card__filter">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter
          </button>

          {/* Export (presentational) */}
          <button type="button" className="txn-table-card__export" title="Export">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>

          {onViewAll && (
            <button type="button" className="txn-table-card__filter" onClick={onViewAll}>
              View all
            </button>
          )}
        </div>
      </div>

      <div className="table-responsive">
        <table className="txn-table-ent">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="txn-table-ent__empty">
                  No transactions found
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const meta = getTransactionTone(tx.type);
                return (
                  <tr key={tx.id}>
                    <td>{formatDate(tx.created_at, { includeTime: false })}</td>
                    <td>{tx.description || '—'}</td>
                    <td>
                      <span className={`txn-table-ent__badge txn-table-ent__badge--${meta.tone || 'neutral'}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className={`txn-table-ent__amount--${meta.tone || 'neutral'}`}>
                      {meta.sign}Rs. {formatCurrency(tx.amount)}
                    </td>
                    <td className="font-monospace" style={{ fontSize: '0.8rem' }}>
                      {tx.reference_number || '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

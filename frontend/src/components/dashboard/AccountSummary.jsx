import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';

export default function AccountSummary({ totalBalance = 0, accounts = [] }) {
  const primary = accounts.find((a) => a.status === 'active') || accounts[0];
  const accountLabel = primary
    ? `${(primary.account_type || 'Account').charAt(0).toUpperCase() + (primary.account_type || '').slice(1)} ••${(primary.account_number || '').slice(-4)}`
    : 'No active account';

  return (
    <div className="acct-summary">
      <div className="acct-summary__eyebrow">Total balance</div>
      <div className="acct-summary__balance">
        Rs. {formatCurrency(totalBalance)}
      </div>
      <div className="acct-summary__available">
        Available across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
      </div>
      <div className="acct-summary__detail">{accountLabel}</div>

      <div className="acct-summary__actions">
        <Link to="/customer/transfer" className="acct-summary__action acct-summary__action--primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
          Transfer money
        </Link>
        <Link to="/customer/transactions" className="acct-summary__action acct-summary__action--ghost">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          View statements
        </Link>
        <Link to="/customer/loans" className="acct-summary__action acct-summary__action--ghost">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          Loans &amp; bills
        </Link>
      </div>
    </div>
  );
}

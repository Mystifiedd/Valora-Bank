import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, extractApiError } from '../../utils/format';
import AccountSummary from '../../components/dashboard/AccountSummary';
import InfoCard from '../../components/dashboard/InfoCard';
import TransactionsTable from '../../components/dashboard/TransactionsTable';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const [accRes, notifRes, loanRes] = await Promise.all([
          api.get('/accounts', { params: { page: 1, page_size: 5 } }),
          api.get('/notifications', { params: { page: 1, page_size: 5 } }),
          api.get('/loans', { params: { page: 1, page_size: 5 } })
        ]);

        if (!isMounted) return;

        const fetchedAccounts = accRes.data.accounts || [];
        setAccounts(fetchedAccounts);
        setNotifications(notifRes.data.notifications || []);
        setLoans(loanRes.data.loans || []);

        if (fetchedAccounts.length > 0) {
          const firstAccountId = fetchedAccounts[0].id;
          const txRes = await api.get('/transactions', {
            params: { account_id: firstAccountId, page: 1, page_size: 5 }
          });
          if (isMounted) {
            setTransactions(txRes.data.transactions || []);
          }
        } else {
          setTransactions([]);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(extractApiError(err, 'Failed to load dashboard'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
  const pendingLoans = loans.filter((l) => l.status === 'pending').length;
  const unreadNotifs = notifications.filter((n) => !n.is_read).length;

  const timeOfDay = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="modern-dashboard">
      {/* Welcome strip */}
      <div className="modern-dashboard__welcome">
        <div>
          <p className="modern-dashboard__greeting">{timeOfDay}</p>
          <h1 className="modern-dashboard__name">{user.first_name} {user.last_name}</h1>
        </div>
        <p className="modern-dashboard__date">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <Alert type="danger" message={error} onClose={() => setError('')} />

      {/* Account summary banner */}
      <AccountSummary totalBalance={totalBalance} accounts={accounts} />

      {/* Info cards */}
      <div className="info-cards-row">
        <InfoCard
          variant="alert"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          }
          title="Security check"
          description="Your account is secured with standard protection. Enable two-factor authentication for added security."
        />
        <InfoCard
          variant="offer"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          }
          title={pendingLoans > 0 ? `${pendingLoans} loan${pendingLoans > 1 ? 's' : ''} pending` : 'Loan offers available'}
          description={pendingLoans > 0 ? 'You have outstanding loan applications under review. Visit the loans section for details.' : 'Pre-approved personal loan offers are waiting for you. Check eligibility today.'}
        />
        <InfoCard
          variant="insight"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          }
          title="Account insight"
          description={`You have ${accounts.length} account${accounts.length !== 1 ? 's' : ''} with a combined balance of Rs. ${formatCurrency(totalBalance)}.`}
        />
      </div>

      {/* Transactions table */}
      <TransactionsTable
        transactions={transactions}
        onViewAll={() => navigate('/customer/transactions')}
      />
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import Alert from '../../components/Alert';
import { formatDate, extractApiError } from '../../utils/format';
import { PAGE_SIZE } from '../../utils/constants';

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = useCallback((p) => {
    setLoading(true);
    api.get('/notifications', { params: { page: p, page_size: PAGE_SIZE } })
      .then((res) => { setNotifications(res.data.notifications || []); setTotal(res.data.total || 0); })
      .catch((err) => setError(extractApiError(err, 'Failed to load notifications')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchNotifications(page); }, [page, fetchNotifications]);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
    } catch (err) { setError(extractApiError(err, 'Failed to mark as read')); }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    try {
      await Promise.all(unread.map((n) => api.patch(`/notifications/${n.id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) { setError(extractApiError(err, 'Failed to mark all as read')); }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="stack stack-lg">
      <div className="page-header">
        <h1 className="page-header__title">
          Notifications {unreadCount > 0 && <span className="badge badge--danger" style={{ marginLeft: 'var(--space-2)' }}>{unreadCount} unread</span>}
        </h1>
        {unreadCount > 0 && <button className="button button-secondary button-sm" onClick={markAllRead}>Mark All Read</button>}
      </div>

      <Alert type="danger" message={error} onClose={() => setError('')} />

      {loading ? <Spinner /> : (
        <div className="table-card">
          {notifications.length === 0 ? (
            <p style={{ color: 'var(--color-gray-500)', textAlign: 'center', padding: 'var(--space-6) 0', margin: 0 }}>No notifications yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notifications.map((n) => (
                <div key={n.id} className="activity-item" style={{ background: !n.is_read ? 'var(--color-primary-50)' : 'transparent' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      {!n.is_read && <span className="badge badge--primary">New</span>}
                      <strong>{n.title}</strong>
                    </div>
                    <p style={{ margin: 'var(--space-1) 0 0', fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>{n.message}</p>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 120 }}>
                    <small style={{ color: 'var(--color-gray-500)', display: 'block' }}>{formatDate(n.created_at)}</small>
                    {!n.is_read && <button className="button button-secondary button-sm" style={{ marginTop: 'var(--space-1)' }} onClick={() => markRead(n.id)}>Mark Read</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </div>
  );
}

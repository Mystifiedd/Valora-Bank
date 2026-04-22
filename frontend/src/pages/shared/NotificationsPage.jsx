import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import Alert from '../../components/Alert';
import { formatDate, extractApiError } from '../../utils/format';
import { PAGE_SIZE } from '../../utils/constants';

export default function NotificationsPage() {
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
    <div className="stack">
      <div className="page-header">
        <h4 className="page-header__title">
          Notifications {unreadCount > 0 && <span className="badge badge--danger ms-2">{unreadCount} unread</span>}
        </h4>
        {unreadCount > 0 && <button className="button button-outline button-sm" onClick={markAllRead}>Mark All Read</button>}
      </div>

      <Alert type="danger" message={error} onClose={() => setError('')} />

      {loading ? <Spinner /> : (
        <div className="table-card">
          {notifications.length === 0 ? (
            <p className="text-muted text-center py-4 mb-0">No notifications yet.</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((n) => (
                <li key={n.id} className={`notification-item${!n.is_read ? ' notification-item--unread' : ''}`}>
                  <div className="notification-item__body">
                    <div className="d-flex align-items-center gap-2">
                      {!n.is_read && <span className="badge badge--primary rounded-pill">New</span>}
                      <strong>{n.title}</strong>
                    </div>
                    <p className="mb-0 mt-1 small text-muted">{n.message}</p>
                  </div>
                  <div className="notification-item__meta" style={{ minWidth: 120 }}>
                    <small className="text-muted d-block">{formatDate(n.created_at)}</small>
                    {!n.is_read && <button className="button button-secondary button-sm mt-1" onClick={() => markRead(n.id)}>Mark Read</button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </div>
  );
}

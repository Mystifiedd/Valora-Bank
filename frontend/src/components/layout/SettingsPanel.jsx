import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { extractApiError } from '../../utils/format';

/* ── Tab definitions ── */
const TABS = [
  { key: 'profile', label: 'Personal Info', icon: 'user' },
  { key: 'password', label: 'Password', icon: 'lock' },
  { key: 'pin', label: 'Transaction PIN', icon: 'key' }
];

const ICONS = {
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  lock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  key: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  back: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
};

/* ── Profile form ── */
function ProfileForm({ user, onSuccess }) {
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    branch_id: user?.branch_id || ''
  });

  const [branches, setBranches] = useState([]);

  /* Fetch available branches for dropdown */
  useEffect(() => {
    let cancelled = false;
    api.get('/account-requests/branches')
      .then(res => { if (!cancelled) setBranches(res.data.branches || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  /* Update form when user prop changes */
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        branch_id: user.branch_id || ''
      }));
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = { ...form };
      if (payload.branch_id) payload.branch_id = Number(payload.branch_id);
      else delete payload.branch_id;
      const res = await api.put('/auth/profile', payload);
      setSuccess('Profile updated successfully');
      // Use the returned user data directly to update AuthContext
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setError(extractApiError(err, 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <div className="settings-form__group">
        <label className="settings-form__label" htmlFor="sf-first-name">First Name</label>
        <input
          id="sf-first-name"
          className="settings-form__input"
          name="first_name"
          type="text"
          value={form.first_name}
          onChange={handleChange}
          maxLength={80}
          required
        />
      </div>
      <div className="settings-form__group">
        <label className="settings-form__label" htmlFor="sf-last-name">Last Name</label>
        <input
          id="sf-last-name"
          className="settings-form__input"
          name="last_name"
          type="text"
          value={form.last_name}
          onChange={handleChange}
          maxLength={80}
          required
        />
      </div>
      <div className="settings-form__group">
        <label className="settings-form__label" htmlFor="sf-email">Email</label>
        <input
          id="sf-email"
          className="settings-form__input"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          maxLength={150}
          required
        />
      </div>
      <div className="settings-form__group">
        <label className="settings-form__label" htmlFor="sf-phone">Phone Number</label>
        <input
          id="sf-phone"
          className="settings-form__input"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          maxLength={30}
          required
        />
      </div>
      <div className="settings-form__group">
        <label className="settings-form__label" htmlFor="sf-branch">Branch</label>
        <select
          id="sf-branch"
          className="settings-form__input"
          name="branch_id"
          value={form.branch_id}
          onChange={handleChange}
        >
          <option value="">— Select Branch —</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>
      {error && <p className="settings-form__error">{error}</p>}
      {success && <p className="settings-form__success">{ICONS.check} {success}</p>}
      <button className="settings-form__submit" type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}

/* ── Password form ── */
function PasswordForm() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password
      });
      setSuccess('Password changed successfully');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(extractApiError(err, 'Failed to change password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <div className="settings-form__group">
        <label className="settings-form__label" htmlFor="sf-cur-pw">Current Password</label>
        <input
          id="sf-cur-pw"
          className="settings-form__input"
          name="current_password"
          type="password"
          value={form.current_password}
          onChange={handleChange}
          required
        />
      </div>
      <div className="settings-form__group">
        <label className="settings-form__label" htmlFor="sf-new-pw">New Password</label>
        <input
          id="sf-new-pw"
          className="settings-form__input"
          name="new_password"
          type="password"
          value={form.new_password}
          onChange={handleChange}
          minLength={8}
          required
        />
        <span className="settings-form__hint">Minimum 8 characters</span>
      </div>
      <div className="settings-form__group">
        <label className="settings-form__label" htmlFor="sf-conf-pw">Confirm New Password</label>
        <input
          id="sf-conf-pw"
          className="settings-form__input"
          name="confirm_password"
          type="password"
          value={form.confirm_password}
          onChange={handleChange}
          minLength={8}
          required
        />
      </div>
      {error && <p className="settings-form__error">{error}</p>}
      {success && <p className="settings-form__success">{ICONS.check} {success}</p>}
      <button className="settings-form__submit" type="submit" disabled={loading}>
        {loading ? 'Updating…' : 'Change Password'}
      </button>
    </form>
  );
}

/* ── Transaction PIN form ── */
function PinForm({ hasPin }) {
  const [form, setForm] = useState({ current_pin: '', new_pin: '', confirm_pin: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_pin !== form.confirm_pin) {
      setError('PINs do not match');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = { new_pin: form.new_pin };
      if (hasPin) payload.current_pin = form.current_pin;
      await api.put('/auth/transaction-pin', payload);
      setSuccess(hasPin ? 'Transaction PIN updated' : 'Transaction PIN set successfully');
      setForm({ current_pin: '', new_pin: '', confirm_pin: '' });
    } catch (err) {
      setError(extractApiError(err, 'Failed to update PIN'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      {hasPin && (
        <div className="settings-form__group">
          <label className="settings-form__label" htmlFor="sf-cur-pin">Current PIN</label>
          <input
            id="sf-cur-pin"
            className="settings-form__input settings-form__input--pin"
            name="current_pin"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            minLength={4}
            value={form.current_pin}
            onChange={handleChange}
            required
          />
        </div>
      )}
      <div className="settings-form__group">
        <label className="settings-form__label" htmlFor="sf-new-pin">
          {hasPin ? 'New PIN' : 'Set PIN'}
        </label>
        <input
          id="sf-new-pin"
          className="settings-form__input settings-form__input--pin"
          name="new_pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          minLength={4}
          value={form.new_pin}
          onChange={handleChange}
          required
        />
        <span className="settings-form__hint">4–6 digit numeric PIN</span>
      </div>
      <div className="settings-form__group">
        <label className="settings-form__label" htmlFor="sf-conf-pin">Confirm PIN</label>
        <input
          id="sf-conf-pin"
          className="settings-form__input settings-form__input--pin"
          name="confirm_pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          minLength={4}
          value={form.confirm_pin}
          onChange={handleChange}
          required
        />
      </div>
      {error && <p className="settings-form__error">{error}</p>}
      {success && <p className="settings-form__success">{ICONS.check} {success}</p>}
      <button className="settings-form__submit" type="submit" disabled={loading}>
        {loading ? 'Saving…' : hasPin ? 'Change PIN' : 'Set PIN'}
      </button>
    </form>
  );
}

/* ── Main settings panel ── */
export default function SettingsPanel({ onBack, user }) {
  const [activeTab, setActiveTab] = useState(null);

  const handleBack = useCallback(() => {
    if (activeTab) {
      setActiveTab(null);
    } else {
      onBack();
    }
  }, [activeTab, onBack]);

  /* Re-fetch user after profile update so drawer reflects changes */
  const { setUser } = useAuth();
  const refreshUser = useCallback(async (updatedUser) => {
    try {
      // If the update response already contains user data, use it directly
      if (updatedUser && updatedUser.id) {
        setUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        return;
      }
      // Otherwise fetch fresh data
      const res = await api.get('/auth/me');
      setUser(res.data);
      sessionStorage.setItem('user', JSON.stringify(res.data));
    } catch {
      /* silent */
    }
  }, [setUser]);

  return (
    <div className="settings-panel">
      {/* Header */}
      <div className="settings-panel__header">
        <button className="settings-panel__back" onClick={handleBack} type="button" aria-label="Back">
          {ICONS.back}
        </button>
        <h3 className="settings-panel__title">
          {activeTab ? TABS.find((t) => t.key === activeTab)?.label : 'Settings'}
        </h3>
      </div>

      {/* Tab list or form */}
      {!activeTab ? (
        <div className="settings-panel__menu">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className="settings-panel__menu-item"
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              <span className="settings-panel__menu-icon">{ICONS[tab.icon]}</span>
              <span className="settings-panel__menu-label">{tab.label}</span>
              <svg className="settings-panel__menu-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>
      ) : activeTab === 'profile' ? (
        <ProfileForm user={user} onSuccess={refreshUser} />
      ) : activeTab === 'password' ? (
        <PasswordForm />
      ) : (
        <PinForm hasPin={!!user?.has_transaction_pin} />
      )}
    </div>
  );
}

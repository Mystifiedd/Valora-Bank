import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { maskSensitive, formatDate, formatCurrency } from '../../utils/format';
import SettingsPanel from './SettingsPanel';

/* ── KYC status badge colour ── */
const KYC_BADGE = {
  verified: 'profile-drawer__badge--success',
  pending: 'profile-drawer__badge--warning',
  rejected: 'profile-drawer__badge--danger'
};

export default function ProfileDrawer({ open, onClose }) {
  const { user, logout } = useAuth();
  const drawerRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);

  /* reset settings view when drawer closes */
  useEffect(() => {
    if (!open) setShowSettings(false);
  }, [open]);

  const openSettings = useCallback(() => setShowSettings(true), []);
  const closeSettings = useCallback(() => setShowSettings(false), []);

  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  /* close when clicking outside */
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handleClick), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open, onClose]);

  const initials = user
    ? `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase()
    : '?';

  const handleLogout = () => {
    onClose();
    logout({ redirect: true });
  };

  const accounts = user?.accounts || [];
  const kycRecords = user?.kyc || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`profile-drawer-backdrop${open ? ' profile-drawer-backdrop--visible' : ''}`}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        ref={drawerRef}
        className={`profile-drawer${open ? ' profile-drawer--open' : ''}`}
        role="dialog"
        aria-label="Profile"
      >
        <div className="profile-drawer__header">
          <h2 className="profile-drawer__title">{showSettings ? 'Settings' : 'Profile'}</h2>
          <button className="profile-drawer__close" onClick={onClose} aria-label="Close" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {showSettings ? (
          <SettingsPanel onBack={closeSettings} user={user} />
        ) : (
        <>
        <div className="profile-drawer__body">
          {/* Avatar */}
          <div className="profile-drawer__avatar">{initials}</div>

          {/* Name & email */}
          <h3 className="profile-drawer__name">
            {user?.first_name} {user?.last_name}
          </h3>
          <p className="profile-drawer__email">{user?.email}</p>

          {/* ── Personal Information ── */}
          <div className="profile-drawer__section">
            <h4 className="profile-drawer__section-title">Personal Information</h4>
            <dl className="profile-drawer__details">
              <div className="profile-drawer__detail-row">
                <dt>Full Name</dt>
                <dd>{user?.first_name} {user?.last_name}</dd>
              </div>
              <div className="profile-drawer__detail-row">
                <dt>Email</dt>
                <dd>{user?.email}</dd>
              </div>
              <div className="profile-drawer__detail-row">
                <dt>Phone</dt>
                <dd>{user?.phone || '—'}</dd>
              </div>
              <div className="profile-drawer__detail-row">
                <dt>Role</dt>
                <dd>
                  <span className="profile-drawer__role-badge">{user?.role}</span>
                </dd>
              </div>
              <div className="profile-drawer__detail-row">
                <dt>User ID</dt>
                <dd>#{user?.id}</dd>
              </div>
              {user?.created_at && (
                <div className="profile-drawer__detail-row">
                  <dt>Member Since</dt>
                  <dd>{formatDate(user.created_at, { includeTime: false })}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* ── Branch Information ── */}
          {(user?.branch_name || user?.branch_SWIFT) && (
            <div className="profile-drawer__section">
              <h4 className="profile-drawer__section-title">Branch</h4>
              <dl className="profile-drawer__details">
                {user.branch_name && (
                  <div className="profile-drawer__detail-row">
                    <dt>Branch Name</dt>
                    <dd>{user.branch_name}</dd>
                  </div>
                )}
                {user.branch_SWIFT && (
                  <div className="profile-drawer__detail-row">
                    <dt>SWIFT Code</dt>
                    <dd>{user.branch_SWIFT}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* ── Accounts (primarily for Customer) ── */}
          {accounts.length > 0 && (
            <div className="profile-drawer__section">
              <h4 className="profile-drawer__section-title">
                Accounts
                <span className="profile-drawer__count">{accounts.length}</span>
              </h4>
              <div className="profile-drawer__accounts">
                {accounts.map((acc) => (
                  <div key={acc.id} className="profile-drawer__account-card">
                    <div className="profile-drawer__account-top">
                      <span className="profile-drawer__account-type">{acc.account_type}</span>
                      <span className={`profile-drawer__badge profile-drawer__badge--${acc.status === 'active' ? 'success' : acc.status === 'frozen' ? 'warning' : 'danger'}`}>
                        {acc.status}
                      </span>
                    </div>
                    <div className="profile-drawer__account-number">
                      {acc.account_number}
                    </div>
                    <div className="profile-drawer__account-balance">
                      Rs. {formatCurrency(acc.balance)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── KYC Information ── */}
          {kycRecords.length > 0 && (
            <div className="profile-drawer__section">
              <h4 className="profile-drawer__section-title">KYC Documents</h4>
              <div className="profile-drawer__kyc-list">
                {kycRecords.map((doc) => (
                  <div key={doc.id} className="profile-drawer__kyc-card">
                    <div className="profile-drawer__kyc-top">
                      <span className="profile-drawer__kyc-type">{doc.document_type}</span>
                      <span className={`profile-drawer__badge ${KYC_BADGE[doc.status] || ''}`}>
                        {doc.status}
                      </span>
                    </div>
                    <div className="profile-drawer__kyc-number">
                      {maskSensitive(doc.document_number, 4)}
                    </div>
                    <div className="profile-drawer__kyc-date">
                      Submitted {formatDate(doc.submitted_at, { includeTime: false })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {kycRecords.length === 0 && user?.role === 'Customer' && (
            <div className="profile-drawer__section">
              <h4 className="profile-drawer__section-title">KYC Documents</h4>
              <p className="profile-drawer__empty">No KYC documents submitted yet.</p>
            </div>
          )}
        </div>

        {/* Footer with settings + logout */}
        <div className="profile-drawer__footer">
          <button className="profile-drawer__settings-btn" onClick={openSettings} type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Settings
          </button>
          <button className="profile-drawer__logout" onClick={handleLogout} type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
        </>
        )}
      </aside>
    </>
  );
}

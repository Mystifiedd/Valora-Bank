import { useState, useMemo, useCallback, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileDrawer from './ProfileDrawer';

/* ── Inline SVG icons (Lucide-style, 20×20) ── */
const ICONS = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  wallet: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>
  ),
  briefcase: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  ),
  trending: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
  ),
  building: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
  ),
  inbox: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
  ),
  clipboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  ),
  arrows: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
  ),
  send: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
  ),
  lifebuoy: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  ticket: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
  ),
};

/* ── role-based navigation config ── */
const NAV_CONFIG = {
  Admin: [
    { label: 'Overview',      path: '/admin',                  icon: 'grid' },
    { label: 'Users',         path: '/admin/users',            icon: 'users' },
    { label: 'Accounts',      path: '/admin/accounts',         icon: 'wallet' },
    { label: 'Employees',     path: '/admin/employees',        icon: 'briefcase' },
    { label: 'Loans',         path: '/admin/loans',            icon: 'trending' },
    { label: 'Branches',      path: '/admin/branches',         icon: 'building' },
    { label: 'Requests',      path: '/admin/account-requests', icon: 'inbox' },
    { label: 'Audit Logs',    path: '/admin/audit-logs',       icon: 'clipboard' },
    { label: 'Notifications', path: '/admin/notifications',    icon: 'bell' },
  ],
  Employee: [
    { label: 'Overview',      path: '/employee',                icon: 'grid' },
    { label: 'Branch Users',  path: '/employee/branch-users',   icon: 'users' },
    { label: 'KYC',           path: '/employee/kyc',            icon: 'shield' },
    { label: 'Requests',      path: '/employee/account-requests', icon: 'inbox' },
    { label: 'Tickets',       path: '/employee/tickets',        icon: 'ticket' },
    { label: 'Notifications', path: '/employee/notifications',  icon: 'bell' },
  ],
  Customer: [
    { label: 'Overview',      path: '/customer',               icon: 'grid' },
    { label: 'Accounts',      path: '/customer/accounts',      icon: 'wallet' },
    { label: 'Transactions',  path: '/customer/transactions',  icon: 'arrows' },
    { label: 'Transfer',      path: '/customer/transfer',      icon: 'send' },
    { label: 'Loans',         path: '/customer/loans',         icon: 'trending' },
    { label: 'Support',       path: '/customer/support',       icon: 'lifebuoy' },
    { label: 'KYC',           path: '/customer/kyc',           icon: 'shield' },
    { label: 'Notifications', path: '/customer/notifications', icon: 'bell' },
  ],
};

const ROLE_SUBTITLE = { Admin: 'Administration', Employee: 'Employee Portal', Customer: 'Personal Banking' };

export default function GlobalNav() {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const links = useMemo(() => NAV_CONFIG[user?.role] || [], [user?.role]);

  const initials = useMemo(() => {
    if (!user) return '?';
    return `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase();
  }, [user]);

  const toggleMobile = useCallback(() => setMobileOpen((p) => !p), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((p) => !p), []);

  /* close mobile menu on route change */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <>
      <nav className={`gnav${mobileOpen ? ' gnav--open' : ''}`}>
        <div className="gnav__inner">
          {/* Brand — acts as NavLink to role root */}
          <NavLink to={`/${(user?.role || '').toLowerCase()}`} className="gnav__brand">
            <img src="/logo.png" alt="Valora Bank" className="gnav__logo" />
            <div className="gnav__brand-text">
              <span className="gnav__brand-name">Valora Bank</span>
              <span className="gnav__brand-sub">{ROLE_SUBTITLE[user?.role] || ''}</span>
            </div>
          </NavLink>

          {/* Desktop links */}
          <ul className="gnav__links">
            {links.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  end={link.path === `/${user?.role?.toLowerCase()}`}
                  className={({ isActive }) =>
                    `gnav__link${isActive ? ' gnav__link--active' : ''}`
                  }
                >
                  <span className="gnav__link-icon">{ICONS[link.icon]}</span>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right section */}
          <div className="gnav__right">
            <button
              className="gnav__avatar"
              onClick={toggleDrawer}
              aria-label="Open profile"
              type="button"
            >
              {initials}
            </button>

            {/* Animated hamburger (mobile) */}
            <button
              className="gnav__hamburger"
              onClick={toggleMobile}
              aria-label="Toggle navigation"
              type="button"
            >
              <span className="gnav__hamburger-icon" />
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        <div className="gnav__mobile-menu">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === `/${user?.role?.toLowerCase()}`}
              className={({ isActive }) =>
                `gnav__mobile-link${isActive ? ' gnav__mobile-link--active' : ''}`
              }
            >
              <span className="gnav__link-icon">{ICONS[link.icon]}</span>
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Profile drawer */}
      <ProfileDrawer open={drawerOpen} onClose={toggleDrawer} />
    </>
  );
}

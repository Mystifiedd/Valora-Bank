import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlobalNav from './GlobalNav';

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  /* scroll to top on route change */
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell app-shell--no-sidebar">
      <GlobalNav />
      <main className="app-main app-main--full">
        <div className="layout-container">
          {children}
        </div>
      </main>
    </div>
  );
}

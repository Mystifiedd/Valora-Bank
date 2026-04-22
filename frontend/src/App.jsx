import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAccountsPage from './pages/admin/AdminAccountsPage';
import AdminEmployeesPage from './pages/admin/AdminEmployeesPage';
import AdminLoansPage from './pages/admin/AdminLoansPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import BranchManagementPage from './pages/admin/BranchManagementPage';

// Employee pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import BranchUsersPage from './pages/employee/BranchUsersPage';
import KycVerificationPage from './pages/employee/KycVerificationPage';
import EmployeeTicketsPage from './pages/employee/EmployeeTicketsPage';
import EmployeeLoansPage from './pages/employee/EmployeeLoansPage';
import AccountRequestsPage from './pages/employee/AccountRequestsPage';
import NotificationsPage from './pages/shared/NotificationsPage';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerAccountsPage from './pages/customer/CustomerAccountsPage';
import CustomerTransactionsPage from './pages/customer/CustomerTransactionsPage';
import CustomerLoansPage from './pages/customer/CustomerLoansPage';
import CustomerSupportPage from './pages/customer/CustomerSupportPage';
import TransferFundsPage from './pages/customer/TransferFundsPage';
import CustomerKycPage from './pages/customer/CustomerKycPage';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Admin') return <Navigate to="/admin" replace />;
  if (user.role === 'Employee') return <Navigate to="/employee" replace />;
  return <Navigate to="/customer" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/unauthorized" element={<><Navbar /><UnauthorizedPage /></>} />

        {/* Home redirect */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Admin routes */}
        <Route path="/admin" element={<PrivateRoute roles={['Admin']}><DashboardLayout><AdminDashboard /></DashboardLayout></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute roles={['Admin']}><DashboardLayout><AdminUsersPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/admin/accounts" element={<PrivateRoute roles={['Admin']}><DashboardLayout><AdminAccountsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/admin/employees" element={<PrivateRoute roles={['Admin']}><DashboardLayout><AdminEmployeesPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/admin/loans" element={<PrivateRoute roles={['Admin']}><DashboardLayout><AdminLoansPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/admin/branches" element={<PrivateRoute roles={['Admin']}><DashboardLayout><BranchManagementPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/admin/account-requests" element={<PrivateRoute roles={['Admin']}><DashboardLayout><AccountRequestsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/admin/audit-logs" element={<PrivateRoute roles={['Admin']}><DashboardLayout><AdminAuditLogsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/admin/notifications" element={<PrivateRoute roles={['Admin']}><DashboardLayout><NotificationsPage /></DashboardLayout></PrivateRoute>} />

        {/* Employee routes */}
        <Route path="/employee" element={<PrivateRoute roles={['Employee']}><DashboardLayout><EmployeeDashboard /></DashboardLayout></PrivateRoute>} />
        <Route path="/employee/branch-users" element={<PrivateRoute roles={['Employee']}><DashboardLayout><BranchUsersPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/employee/kyc" element={<PrivateRoute roles={['Employee']}><DashboardLayout><KycVerificationPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/employee/account-requests" element={<PrivateRoute roles={['Employee']}><DashboardLayout><AccountRequestsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/employee/tickets" element={<PrivateRoute roles={['Employee']}><DashboardLayout><EmployeeTicketsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/employee/loans" element={<PrivateRoute roles={['Employee']}><DashboardLayout><EmployeeLoansPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/employee/notifications" element={<PrivateRoute roles={['Employee']}><DashboardLayout><NotificationsPage /></DashboardLayout></PrivateRoute>} />

        {/* Customer routes */}
        <Route path="/customer" element={<PrivateRoute roles={['Customer']}><DashboardLayout><CustomerDashboard /></DashboardLayout></PrivateRoute>} />
        <Route path="/customer/accounts" element={<PrivateRoute roles={['Customer']}><DashboardLayout><CustomerAccountsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/customer/transactions" element={<PrivateRoute roles={['Customer']}><DashboardLayout><CustomerTransactionsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/customer/loans" element={<PrivateRoute roles={['Customer']}><DashboardLayout><CustomerLoansPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/customer/support" element={<PrivateRoute roles={['Customer']}><DashboardLayout><CustomerSupportPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/customer/transfer" element={<PrivateRoute roles={['Customer']}><DashboardLayout><TransferFundsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/customer/kyc" element={<PrivateRoute roles={['Customer']}><DashboardLayout><CustomerKycPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/customer/notifications" element={<PrivateRoute roles={['Customer']}><DashboardLayout><NotificationsPage /></DashboardLayout></PrivateRoute>} />

        {/* Catch all */}
        <Route path="*" element={<><Navbar /><NotFoundPage /></>} />
      </Routes>
    </BrowserRouter>
  );
}

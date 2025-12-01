import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BusinessProfilePage from './pages/BusinessProfilePage';
import ServicesPage from './pages/ServicesPage';
import AppointmentsPage from './pages/AppointmentsPage';
import UserProfilePage from './pages/UserProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResendVerificationPage from './pages/ResendVerificationPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import VerifyEmailReminderPage from './pages/VerifyEmailReminderPage';
import PrivateRoute from './components/PrivateRoute';
import GuestRoute from './components/GuestRoute';
import UserManagementPage from './pages/UserManagementPage';
import ReportsPage from './pages/ReportsPage';
import Header from './components/Header';
import PublicHeader from './components/PublicHeader';
import RoleRedirect from './components/RoleRedirect';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminAppointmentsPage from './pages/AdminAppointmentsPage';
import AdminServicesPage from './pages/AdminServicesPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AdminUserDetailPage from './pages/AdminUserDetailPage';
import AdminBusinessManagementPage from './pages/AdminBusinessManagementPage';
import AdminBusinessDetailsPage from './pages/AdminBusinessDetailsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminTeamPage from './pages/AdminTeamPage';
import AdminActivityLogPage from './pages/AdminActivityLogPage';
import AdminCollaboratorsPage from './pages/AdminCollaboratorsPage';
import PermissionsManagementPage from './pages/PermissionsManagementPage';
import BusinessOwnerDashboardPage from './pages/BusinessOwnerDashboardPage';
import BusinessOwnerAppointmentsPage from './pages/BusinessOwnerAppointmentsPage';
import BusinessOwnerServicesPage from './pages/BusinessOwnerServicesPage';
import BusinessOwnerStaffPage from './pages/BusinessOwnerStaffPage';
import CreateServicePage from './pages/CreateServicePage';
import EditServicePage from './pages/EditServicePage';
import BusinessOwnerClientsPage from './pages/BusinessOwnerClientsPage';
import BusinessOwnerClientProfilePage from './pages/BusinessOwnerClientProfilePage';
import BusinessOwnerClientMessagePage from './pages/BusinessOwnerClientMessagePage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import StaffAppointmentsPage from './pages/StaffAppointmentsPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import ClientAppointmentsPage from './pages/ClientAppointmentsPage';
import ClientAppointmentDetailsPage from './pages/ClientAppointmentDetailsPage';
import ClientServicesPage from './pages/ClientServicesPage';
import BusinessesPage from './pages/BusinessesPage';
import BusinessClientsPage from './pages/BusinessClientsPage';
import BusinessDetailsPage from './pages/BusinessDetailsPage';
import FavoritesPage from './pages/FavoritesPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AppointmentBookingPage from './pages/AppointmentBookingPage';
import BusinessBookingPage from './pages/BusinessBookingPage';

// Import context providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Footer from './components/Footer';

// Layout component for authenticated users
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

// Layout component for public pages
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      <PublicHeader />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Component to handle page transitions (simplified to avoid framer-motion issues)
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <div className="flex-grow transition-opacity duration-300 ease-in-out">
      <Routes location={location}>
        {/* Public routes */}
        <Route path="/" element={
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        } />
        <Route path="/login" element={
          <GuestRoute>
            <PublicLayout>
              <LoginPage />
            </PublicLayout>
          </GuestRoute>
        } />
        <Route path="/register" element={
          <GuestRoute>
            <PublicLayout>
              <RegisterPage />
            </PublicLayout>
          </GuestRoute>
        } />
        <Route path="/forgot-password" element={
          <GuestRoute>
            <PublicLayout>
              <ForgotPasswordPage />
            </PublicLayout>
          </GuestRoute>
        } />
        <Route path="/reset-password/:token" element={
          <GuestRoute>
            <PublicLayout>
              <ResetPasswordPage />
            </PublicLayout>
          </GuestRoute>
        } />
        <Route path="/verify-email/:token" element={
          <GuestRoute>
            <PublicLayout>
              <VerifyEmailPage />
            </PublicLayout>
          </GuestRoute>
        } />
        <Route path="/resend-verification" element={
          <GuestRoute>
            <PublicLayout>
              <ResendVerificationPage />
            </PublicLayout>
          </GuestRoute>
        } />

        {/* Onboarding Routes (must be before other private routes) */}
        <Route path="/change-password" element={<PrivateRoute><AuthenticatedLayout><ChangePasswordPage /></AuthenticatedLayout></PrivateRoute>} />
        <Route path="/verify-email-reminder" element={<PrivateRoute><AuthenticatedLayout><VerifyEmailReminderPage /></AuthenticatedLayout></PrivateRoute>} />

        {/* Role-based redirects */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <RoleRedirect />
          </PrivateRoute>
        } />

        {/* Admin routes - only accessible by admins */}
        <Route path="/admin/dashboard" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AuthenticatedLayout>
              <AdminDashboardPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/appointments" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AuthenticatedLayout>
              <AdminAppointmentsPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/services" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AuthenticatedLayout>
              <AdminServicesPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />

        {/* Business owner routes - only accessible by business owners */}
        <Route path="/business-owner/dashboard" element={
          <PrivateRoute allowedRoles={['business_owner']}>
            <AuthenticatedLayout>
              <BusinessOwnerDashboardPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/business-owner/appointments" element={
          <PrivateRoute allowedRoles={['business_owner']}>
            <AuthenticatedLayout>
              <BusinessOwnerAppointmentsPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/business-owner/services" element={
          <PrivateRoute allowedRoles={['business_owner']}>
            <AuthenticatedLayout>
              <BusinessOwnerServicesPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/business-owner/staff" element={
          <PrivateRoute allowedRoles={['business_owner']}>
            <AuthenticatedLayout>
              <BusinessOwnerStaffPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/business-owner/services/create" element={
          <PrivateRoute allowedRoles={['business_owner']}>
            <AuthenticatedLayout>
              <CreateServicePage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/business-owner/services/:id/edit" element={
          <PrivateRoute allowedRoles={['business_owner']}>
            <AuthenticatedLayout>
              <EditServicePage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/business-owner/clients" element={
          <PrivateRoute allowedRoles={['business_owner']}>
            <AuthenticatedLayout>
              <BusinessOwnerClientsPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/business-owner/clients/:id" element={
          <PrivateRoute allowedRoles={['business_owner']}>
            <AuthenticatedLayout>
              <BusinessOwnerClientProfilePage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/business-owner/clients/:id/message" element={
          <PrivateRoute allowedRoles={['business_owner']}>
            <AuthenticatedLayout>
              <BusinessOwnerClientMessagePage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/users" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AuthenticatedLayout>
              <AdminUserManagementPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/users/:id" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AuthenticatedLayout>
              <AdminUserDetailPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/businesses" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AuthenticatedLayout>
              <AdminBusinessManagementPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/businesses/:id" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AuthenticatedLayout>
              <AdminBusinessDetailsPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/reports" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AuthenticatedLayout>
              <AdminReportsPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/team" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AuthenticatedLayout>
              <AdminTeamPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/activity-log" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AuthenticatedLayout>
              <AdminActivityLogPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/collaborators" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AuthenticatedLayout>
              <AdminCollaboratorsPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/collaborators/:id/permissions" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AuthenticatedLayout>
              <PermissionsManagementPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />

        {/* Client routes - only accessible by clients */}
        <Route path="/client/dashboard" element={
          <PrivateRoute allowedRoles={['client']}>
            <AuthenticatedLayout>
              <ClientDashboardPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/client/appointments" element={
          <PrivateRoute allowedRoles={['client']}>
            <AuthenticatedLayout>
              <ClientAppointmentsPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/client/appointments/:id" element={
          <PrivateRoute allowedRoles={['client']}>
            <AuthenticatedLayout>
              <ClientAppointmentDetailsPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/client/services" element={
          <PrivateRoute allowedRoles={['client']}>
            <AuthenticatedLayout>
              <ClientServicesPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/client/profile" element={
          <PrivateRoute allowedRoles={['client']}>
            <AuthenticatedLayout>
              <UserProfilePage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />

        {/* Business owner routes - only accessible by business owners */}
        <Route path="/business-owner/dashboard" element={
          <PrivateRoute allowedRoles={['business_owner']}>
            <AuthenticatedLayout>
              <BusinessOwnerDashboardPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/business/clients" element={
          <PrivateRoute allowedRoles={['business_owner']}>
            <AuthenticatedLayout>
              <BusinessClientsPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />

        {/* Staff routes - only accessible by staff */}
        <Route path="/staff/dashboard" element={
          <PrivateRoute allowedRoles={['staff']}>
            <AuthenticatedLayout>
              <StaffDashboardPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/staff/appointments" element={
          <PrivateRoute allowedRoles={['staff']}>
            <AuthenticatedLayout>
              <StaffAppointmentsPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />

        {/* Shared routes - accessible by all authenticated users */}

        <Route path="/business-profile" element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <BusinessProfilePage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/businesses" element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <BusinessesPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/services" element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <ServicesPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/appointments" element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <AppointmentsPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <UserProfilePage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/user-management" element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <UserManagementPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <ReportsPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />

        {/* Public/Shared Business Details */}
        <Route path="/businesses/:businessId" element={
          <BusinessDetailsPage />
        } />
        <Route path="/businesses/:businessId/book" element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <BusinessBookingPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />

        {/* Client Favorites */}
        <Route path="/favorites" element={
          <PrivateRoute allowedRoles={['client']}>
            <AuthenticatedLayout>
              <FavoritesPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />

        {/* Client Booking */}
        <Route path="/appointment-booking" element={
          <PrivateRoute allowedRoles={['client']}>
            <AuthenticatedLayout>
              <AppointmentBookingPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />

        {/* Subscription Management */}
        <Route path="/subscription" element={
          <PrivateRoute allowedRoles={['business_owner', 'admin']}>
            <AuthenticatedLayout>
              <SubscriptionPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
      </Routes >
    </div >
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AnimatedRoutes />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
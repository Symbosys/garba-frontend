import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { FindPartnerPage } from './pages/public/FindPartnerPage';
import { EventsPage } from './pages/public/EventsPage';
import { EventDetailPage } from './pages/public/EventDetailPage';
import { CitiesPage } from './pages/public/CitiesPage';
import { CityDetailPage } from './pages/public/CityDetailPage';
import { GroupsPage } from './pages/public/GroupsPage';
import { FavoritesPage } from './pages/public/FavoritesPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { FaqPage } from './pages/public/FaqPage';
import { TermsPage } from './pages/public/TermsPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { SeoCityPage } from './pages/public/SeoCityPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// User Pages
import { DashboardPage } from './pages/user/DashboardPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { EditProfilePage } from './pages/user/EditProfilePage';
import { MatchesPage } from './pages/user/MatchesPage';
import { MessagesPage } from './pages/user/MessagesPage';
import { RequestsPage } from './pages/user/RequestsPage';
import { NotificationsPage } from './pages/user/NotificationsPage';
import { SettingsPage } from './pages/user/SettingsPage';
import { MyEventsPage } from './pages/user/MyEventsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';

const getRoleDestination = (role?: string) => {
  if (role === 'SUPER_ADMIN') return '/admin';
  if (role === 'ORGANIZER') return '/events/my-events';
  return '/dashboard';
};

// Auth Guard: When logged in, block access to auth pages and redirect to role-specific panel
const GuestOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isRestoring } = useAuth();
  if (isRestoring) {
    return <div className="min-h-screen bg-slate-50 text-slate-800 grid place-items-center font-medium">Checking session…</div>;
  }
  if (isAuthenticated && user) {
    return <Navigate to={getRoleDestination(user.role)} replace />;
  }
  return <>{children}</>;
};

// Super Admin Route Guard: Only SUPER_ADMIN can access
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isRestoring } = useAuth();
  if (isRestoring) {
    return <div className="min-h-screen bg-slate-50 text-slate-800 grid place-items-center font-medium">Restoring secure session…</div>;
  }
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'SUPER_ADMIN') {
    return <Navigate to={getRoleDestination(user.role)} replace />;
  }
  return <>{children}</>;
};

// Partner Panel Guard: Only PARTNER users can access
const PartnerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isRestoring } = useAuth();
  if (isRestoring) {
    return <div className="min-h-screen bg-slate-50 text-slate-800 grid place-items-center font-medium">Loading your dashboard…</div>;
  }
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'SUPER_ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  if (user.role === 'ORGANIZER') {
    return <Navigate to="/events/my-events" replace />;
  }
  return <>{children}</>;
};

// Organizer Panel Guard: Only ORGANIZER users can access
const OrganizerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isRestoring } = useAuth();
  if (isRestoring) {
    return <div className="min-h-screen bg-slate-50 text-slate-800 grid place-items-center font-medium">Loading event portal…</div>;
  }
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'SUPER_ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  if (user.role === 'PARTNER') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

// Shared User Route Guard (Profile, Edit Profile, Settings): Available to PARTNER and ORGANIZER
const UserProfileRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isRestoring } = useAuth();
  if (isRestoring) {
    return <div className="min-h-screen bg-slate-50 text-slate-800 grid place-items-center font-medium">Loading profile…</div>;
  }
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'SUPER_ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Layout Routes */}
          <Route element={<Layout />}>
            {/* Auth & Initial Screen (Guest Only) */}
            <Route
              path="/"
              element={
                <GuestOnlyRoute>
                  <LoginPage />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/login"
              element={
                <GuestOnlyRoute>
                  <LoginPage />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestOnlyRoute>
                  <RegisterPage />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/verify-otp"
              element={
                <GuestOnlyRoute>
                  <VerifyOtpPage />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <GuestOnlyRoute>
                  <ForgotPasswordPage />
                </GuestOnlyRoute>
              }
            />

            {/* Public Discovery Routes */}
            <Route path="/find-partner" element={<FindPartnerPage />} />
            <Route path="/partners" element={<FindPartnerPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:eventId" element={<EventDetailPage />} />
            <Route path="/cities" element={<CitiesPage />} />
            <Route path="/cities/:city" element={<CityDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* SEO Landing Routes */}
            <Route path="/garba-partner" element={<SeoCityPage />} />
            <Route path="/garba-partner-ranchi" element={<SeoCityPage />} />
            <Route path="/garba-partner-ahmedabad" element={<SeoCityPage />} />
            <Route path="/garba-partner-mumbai" element={<SeoCityPage />} />
            <Route path="/dandiya-partner" element={<SeoCityPage />} />
            <Route path="/navratri-partner" element={<SeoCityPage />} />
            <Route path="/garba-events-ranchi" element={<SeoCityPage />} />
            <Route path="/garba-events-ahmedabad" element={<SeoCityPage />} />
            <Route path="/garba-partner-near-me" element={<SeoCityPage />} />

            {/* Partner Dedicated Routes */}
            <Route
              path="/dashboard"
              element={
                <PartnerRoute>
                  <DashboardPage />
                </PartnerRoute>
              }
            />
            <Route
              path="/matches"
              element={
                <PartnerRoute>
                  <MatchesPage />
                </PartnerRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <PartnerRoute>
                  <MessagesPage />
                </PartnerRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <PartnerRoute>
                  <RequestsPage />
                </PartnerRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <PartnerRoute>
                  <NotificationsPage />
                </PartnerRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <PartnerRoute>
                  <GroupsPage />
                </PartnerRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <PartnerRoute>
                  <FavoritesPage />
                </PartnerRoute>
              }
            />

            {/* Organizer Dedicated Routes */}
            <Route
              path="/events/my-events"
              element={
                <OrganizerRoute>
                  <MyEventsPage />
                </OrganizerRoute>
              }
            />

            {/* Shared User Profile & Settings */}
            <Route
              path="/profile"
              element={
                <UserProfileRoute>
                  <ProfilePage />
                </UserProfileRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <UserProfileRoute>
                  <EditProfilePage />
                </UserProfileRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <UserProfileRoute>
                  <SettingsPage />
                </UserProfileRoute>
              }
            />
          </Route>

          {/* Super Admin Dedicated Console Layout & Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="users/:id" element={<AdminUsersPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="events/:id" element={<AdminEventsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;

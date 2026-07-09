import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Toaster } from '@/components/shared/Toaster';
import { GlobalErrorBoundary } from '@/components/shared/GlobalErrorBoundary';
import { PageErrorBoundary } from '@/components/shared/PageErrorBoundary';
import { RouteLoadingFallback } from '@/components/shared/RouteLoadingFallback';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { useNotificationsBootstrap } from '@/hooks/useNotifications';

import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AdminRoute } from '@/routes/AdminRoute';
import { GuestRoute } from '@/routes/GuestRoute';

// Every page is lazy-loaded so the initial bundle only ships the app shell;
// each route's code (and its heavy dependencies, e.g. TipTap or Recharts)
// is fetched on demand the first time it's visited.
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const ExplorePage = lazy(() => import('@/pages/public/ExplorePage'));
const TagsPage = lazy(() => import('@/pages/public/TagsPage'));
const TagDetailPage = lazy(() => import('@/pages/public/TagDetailPage'));
const CategoriesPage = lazy(() => import('@/pages/public/CategoriesPage'));
const CategoryDetailPage = lazy(() => import('@/pages/public/CategoryDetailPage'));
const AuthorsPage = lazy(() => import('@/pages/public/AuthorsPage'));
const AuthorProfilePage = lazy(() => import('@/pages/public/AuthorProfilePage'));
const AuthorFollowersPage = lazy(() => import('@/pages/public/AuthorFollowersPage'));
const AuthorFollowingPage = lazy(() => import('@/pages/public/AuthorFollowingPage'));
const BlogDetailPage = lazy(() => import('@/pages/public/BlogDetailPage'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

const DashboardOverviewPage = lazy(() => import('@/pages/dashboard/DashboardOverviewPage'));
const WriteBlogPage = lazy(() => import('@/pages/dashboard/WriteBlogPage'));
const DraftsPage = lazy(() => import('@/pages/dashboard/DraftsPage'));
const BookmarksPage = lazy(() => import('@/pages/dashboard/BookmarksPage'));
const NotificationsPage = lazy(() => import('@/pages/dashboard/NotificationsPage'));
const ProfilePage = lazy(() => import('@/pages/dashboard/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/dashboard/SettingsPage'));

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const UserManagementPage = lazy(() => import('@/pages/admin/UserManagementPage'));
const PostModerationPage = lazy(() => import('@/pages/admin/PostModerationPage'));
const AnalyticsPage = lazy(() => import('@/pages/admin/AnalyticsPage'));

/** Wraps a lazy page element with both a per-page error boundary and the shared Suspense fallback. */
function page(element: React.ReactNode) {
  return (
    <PageErrorBoundary>
      <Suspense fallback={<RouteLoadingFallback />}>{element}</Suspense>
    </PageErrorBoundary>
  );
}

function AppRoutes() {
  const ready = useAuthBootstrap();
  useSocketConnection();
  useNotificationsBootstrap();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public site */}
      <Route element={<MainLayout />}>
        <Route path="/" element={page(<HomePage />)} />
        <Route path="/explore" element={page(<ExplorePage />)} />
        <Route path="/tags" element={page(<TagsPage />)} />
        <Route path="/tags/:tag" element={page(<TagDetailPage />)} />
        <Route path="/categories" element={page(<CategoriesPage />)} />
        <Route path="/categories/:category" element={page(<CategoryDetailPage />)} />
        <Route path="/authors" element={page(<AuthorsPage />)} />
        <Route path="/authors/:username" element={page(<AuthorProfilePage />)} />
        <Route path="/authors/:username/followers" element={page(<AuthorFollowersPage />)} />
        <Route path="/authors/:username/following" element={page(<AuthorFollowingPage />)} />
        <Route path="/blog/:slug" element={page(<BlogDetailPage />)} />
        <Route path="*" element={page(<NotFoundPage />)} />
      </Route>

      {/* Auth */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={page(<LoginPage />)} />
          <Route path="/register" element={page(<RegisterPage />)} />
          <Route path="/forgot-password" element={page(<ForgotPasswordPage />)} />
          <Route path="/reset-password" element={page(<ResetPasswordPage />)} />
        </Route>
      </Route>

      {/* User dashboard (protected) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={page(<DashboardOverviewPage />)} />
          <Route path="/dashboard/write" element={page(<WriteBlogPage />)} />
          <Route path="/dashboard/write/:id" element={page(<WriteBlogPage />)} />
          <Route path="/dashboard/drafts" element={page(<DraftsPage />)} />
          <Route path="/dashboard/bookmarks" element={page(<BookmarksPage />)} />
          <Route path="/dashboard/notifications" element={page(<NotificationsPage />)} />
          <Route path="/dashboard/profile" element={page(<ProfilePage />)} />
          <Route path="/dashboard/settings" element={page(<SettingsPage />)} />
        </Route>
      </Route>

      {/* Admin panel (protected + admin role) */}
      <Route element={<AdminRoute />}>
        <Route element={<DashboardLayout admin />}>
          <Route path="/admin" element={page(<AdminDashboardPage />)} />
          <Route path="/admin/users" element={page(<UserManagementPage />)} />
          <Route path="/admin/posts" element={page(<PostModerationPage />)} />
          <Route path="/admin/analytics" element={page(<AnalyticsPage />)} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster />
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

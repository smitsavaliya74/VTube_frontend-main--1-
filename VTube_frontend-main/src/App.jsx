import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// ─── Route-level code splitting (reduces initial bundle ~60%) ────
const Home         = lazy(() => import('./pages/Home'));
const Login        = lazy(() => import('./pages/Login'));
const Register     = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Upload       = lazy(() => import('./pages/Upload'));
const VideoPlayer  = lazy(() => import('./pages/VideoPlayer'));
const Channel      = lazy(() => import('./pages/Channel'));
const Settings     = lazy(() => import('./pages/Settings'));
const Playlist     = lazy(() => import('./pages/Playlist'));
const History      = lazy(() => import('./pages/History'));
const LikedVideos  = lazy(() => import('./pages/LikedVideos'));
const SearchResults= lazy(() => import('./pages/SearchResults'));
const Subscriptions= lazy(() => import('./pages/Subscriptions'));
const Dashboard    = lazy(() => import('./pages/Dashboard'));

// ─── Page-level loading fallback ─────────────────────────────────
function PageFallback() {
  return (
    <div className="page-loader">
      <div className="spinner spinner-lg" aria-label="Loading page..." />
    </div>
  );
}

// ─── Scroll to top on route change ───────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

function AppLayout() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Sidebar collapse state (persisted in localStorage or auto-collapsed on tablet)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const isTablet = window.innerWidth < 1024;
    const stored = localStorage.getItem('vtube-sidebar-collapsed');
    if (isTablet) return true;
    return stored === 'true';
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('vtube-sidebar-collapsed', String(next));
      return next;
    });
  };

  const authRoutes = ['/login', '/register', '/forgot-password'];
  const isAuthPage = authRoutes.includes(location.pathname);
  const showSidebar = !isAuthPage;

  // Don't render anything while auth is loading (prevents layout flash)
  if (loading) {
    return (
      <div className="page-loader" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg" aria-label="Loading..." />
      </div>
    );
  }

  const mainClass = [
    'main-content',
    showSidebar ? 'with-sidebar' : '',
    showSidebar && sidebarCollapsed ? 'sidebar-collapsed' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="app-container">
      <ScrollToTop />
      <Navbar 
        onToggleSidebar={toggleSidebar} 
        sidebarCollapsed={sidebarCollapsed} 
        showHamburger={showSidebar} 
      />
      {showSidebar && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      )}
      <main className={mainClass} id="main-content">
        <ErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/"                    element={<Home />} />
              <Route path="/login"               element={<Login />} />
              <Route path="/register"            element={<Register />} />
              <Route path="/forgot-password"     element={<ForgotPassword />} />
              <Route path="/upload"              element={<Upload />} />
              <Route path="/video/:videoId"      element={<VideoPlayer />} />
              <Route path="/channel/:username"   element={<Channel />} />
              <Route path="/settings"            element={<Settings />} />
              <Route path="/playlist/:playlistId"element={<Playlist />} />
              <Route path="/history"             element={<History />} />
              <Route path="/liked"               element={<LikedVideos />} />
              <Route path="/results"             element={<SearchResults />} />
              <Route path="/subscriptions"       element={<Subscriptions />} />
              <Route path="/dashboard"           element={<Dashboard />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppLayout />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

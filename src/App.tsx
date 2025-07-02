import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { useAuthStore } from './store/authStore';
import { useNotificationStore } from './store/notificationStore';
import { useThemeStore } from './store/themeStore';

// Pages
import LoginPage from './pages/auth/LoginPage';
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';
import ModerateAdminDashboard from './pages/dashboards/ModerateAdminDashboard';
import CEODashboard from './pages/dashboards/CEODashboard';
import RegionalAdminDashboard from './pages/dashboards/RegionalAdminDashboard';
import AgentDashboard from './pages/dashboards/AgentDashboard';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Check authentication on app load
    checkAuth();
    
    // Fetch notifications if authenticated
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, checkAuth, fetchNotifications]);

  // Initialize theme on app load (separate effect to avoid dependency issues)
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply current theme to document immediately
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, setTheme]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          } />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            {/* Super Admin Routes */}
            <Route path="super-admin" element={<SuperAdminDashboard />} />
            <Route path="super-admin/*" element={<SuperAdminDashboard />} />
            
            {/* Moderate Admin Routes */}
            <Route path="moderate-admin" element={<ModerateAdminDashboard />} />
            <Route path="moderate-admin/*" element={<ModerateAdminDashboard />} />
            
            {/* CEO Routes */}
            <Route path="ceo" element={<CEODashboard />} />
            <Route path="ceo/*" element={<CEODashboard />} />
            
            {/* Regional Admin Routes */}
            <Route path="regional-admin" element={<RegionalAdminDashboard />} />
            <Route path="regional-admin/*" element={<RegionalAdminDashboard />} />
            
            {/* Agent Routes */}
            <Route path="agent" element={<AgentDashboard />} />
            <Route path="agent/*" element={<AgentDashboard />} />
          </Route>

          {/* Default Redirects */}
          <Route path="/" element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          {/* Catch all route */}
          <Route path="*" element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          } />
        </Routes>
      </Router>
      
      {/* Global Toast Notifications */}
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default App;

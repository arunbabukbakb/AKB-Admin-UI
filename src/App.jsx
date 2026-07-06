import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { publicRoutes, protectedRoutes } from './routes/routes';
import AdminLayout from './components/Layout/AdminLayout';
import './theme.css';

// Authentication Guard Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the /login page, saving the requested return path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const { theme, preset, sidebarBg, headerBg } = useSelector((state) => state.theme);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Apply theme attributes dynamically to root html node
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-preset', preset);
    document.documentElement.setAttribute('data-sidebar-bg', sidebarBg);
    document.documentElement.setAttribute('data-header-bg', headerBg);
  }, [theme, preset, sidebarBg, headerBg]);

  return (
    <Routes>
      {/* Public Auth Routes */}
      {publicRoutes.map((route) => (
        <Route 
          key={route.path} 
          path={route.path} 
          element={route.element} 
        />
      ))}

      {/* Protected Admin Console Routes wrapped with Sidebar layouts */}
      {protectedRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute>
              <AdminLayout>
                {route.element}
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Fallback Redirection */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}

export default App;

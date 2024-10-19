import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import { useSessionExpiration } from './contexts/SessionExpirationContext';
import { isTokenExpired } from './hooks/useAuth';

const ProtectedRoute: React.FC = () => {
  const cookies = new Cookies();
  const token = cookies.get('token');
  const { triggerSessionExpiration } = useSessionExpiration();

  useEffect(() => {
    if (!token || isTokenExpired(token)) {
      triggerSessionExpiration(); // Handle session expiration (e.g., show a modal)
    }
  }, [token, triggerSessionExpiration]);

  // Redirect to login if no token or token is expired
  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // If token is valid, render the protected content
};

export default ProtectedRoute;

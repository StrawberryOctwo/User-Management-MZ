import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';
import { isTokenExpired } from './hooks/useAuth';

interface DecodedToken {
  id: number;
  roles: string[];
  exp: number;
}

interface ProtectedRouteProps {
  requiredRoles?: string[];
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles, children }) => {
  const cookies = new Cookies();
  const location = useLocation();
  const token = cookies.get('token');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const validateAccess = () => {
      if (!token || isTokenExpired(token)) {
        setIsAuthorized(false);
        return;
      }

      try {
        const decoded = jwtDecode<DecodedToken>(token);

        // If no specific roles are required, just check if the token is valid
        if (!requiredRoles) {
          setIsAuthorized(true);
          return;
        }

        const hasRequiredRole = requiredRoles.some(role =>
          decoded.roles.includes(role)
        );

        setIsAuthorized(hasRequiredRole);

      } catch (error) {
        console.error('Token validation error:', error);
        setIsAuthorized(false);
      }
    };

    validateAccess();
  }, [token, requiredRoles, location.pathname]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    // Redirect to login if not authenticated, or to 403 page if authenticated but unauthorized
    return token ?
      <Navigate to="/status/403" replace state={{ from: location }} /> :
      <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If there are children, render them, otherwise render the Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode'; // Ensure it's correctly imported
import { isTokenExpired } from './hooks/useAuth'; // Your existing logic

interface DecodedToken {
  id: number;
  roles: string[];
  exp: number;
}

const ProtectedRoute: React.FC<{ requiredRoles?: string[] }> = ({ requiredRoles }) => {
  const cookies = new Cookies();
  const navigate = useNavigate();
  const token = cookies.get('token');

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // Use `null` for pending state

  useEffect(() => {
    const validateToken = () => {
      if (!token || isTokenExpired(token)) {
        setIsAuthorized(false); // Mark as unauthorized if token is missing/expired
        return;
      }

      try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (
          requiredRoles &&
          !requiredRoles.some((role) => decoded.roles.includes(role))
        ) {
          console.warn('User does not have the required roles:', requiredRoles);
          setIsAuthorized(false); // Mark as unauthorized if roles don’t match
          return;
        }

        setIsAuthorized(true); // Token is valid and user is authorized
      } catch (error) {
        console.error('Failed to decode token:', error);
        setIsAuthorized(false); // Invalid token format
      }
    };

    validateToken(); // Call token validation on component mount
  }, [token, requiredRoles]); // Add only necessary dependencies

  // If validation is pending, render nothing (or a loading spinner)
  if (isAuthorized === null) {
    return <div>Loading...</div>; // Optional: Show a loading state
  }

  // If unauthorized, navigate to login
  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  // If authorized, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;

import { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode'; // Make sure this is imported correctly

interface DecodedToken {
  id: number;
  roles: string[];  // Array of roles
  exp: number;
}

export const useAuth = () => {
  const [userId, setUserId] = useState<number | null>(null); // State for user ID
  const [userRoles, setUserRoles] = useState<string[] | null>(null); // State for array of roles
  const cookies = new Cookies();
  const token = cookies.get('token');

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setUserId(decoded.id);  // Set the user ID
        setUserRoles(decoded.roles);  // Set the roles array
      } catch (error) {
        console.error('Failed to decode token:', error);
        setUserId(null);  // Reset user ID on error
        setUserRoles(null); // Reset roles on error
      }
    } else {
      setUserId(null);  // Reset user ID if no token is found
      setUserRoles(null); // Reset roles if no token is found
    }
  }, [token]); // Dependency on token

  return { userId, userRoles };
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    return decoded.exp < currentTime; // Token is expired if expiration time is in the past
  } catch (error) {
    console.error('Invalid token format:', error);
    return true; // If token is invalid, consider it expired
  }
};
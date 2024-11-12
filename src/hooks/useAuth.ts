import { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import {jwtDecode} from 'jwt-decode'; // Ensure correct import

interface DecodedToken {
  name: string; // First name
  lastname: string; // Last name
  id: number;
  roles: string[]; // Array of roles
  exp: number; // Expiration time (Unix timestamp in seconds)
}

export const useAuth = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[] | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const cookies = new Cookies();
  const token = cookies.get('token'); // Get token from cookies

  useEffect(() => {
    if (token) {
      try {
        if (isTokenExpired(token)) {
          cookies.remove('token'); // Remove expired token
          setUserId(null);
          setUserRoles(null);
          setUsername(null);
        } else {
          const decoded = jwtDecode<DecodedToken>(token);
          setUserId(decoded.id);
          setUserRoles(decoded.roles);
          setUsername(`${decoded.name} ${decoded.lastname}`);
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        setUserId(null);
        setUserRoles(null);
        setUsername(null);
      }
    } else {
      // Reset all state if token is not found
      setUserId(null);
      setUserRoles(null);
      setUsername(null);
    }
  }, [token]);

  return { userId, userRoles, username };
};

// Utility function to check if the token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    return decoded.exp < currentTime; // Expired if expiration time is in the past
  } catch (error) {
    console.error('Invalid token format:', error);
    return true; // Consider invalid token as expired
  }
};

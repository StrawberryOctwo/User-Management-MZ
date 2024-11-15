import { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import {jwtDecode} from 'jwt-decode'; // Ensure correct import

interface DecodedToken {
  name: string;
  lastname: string;
  id: number;
  roles: string[];
  exp: number;
}

export const useAuth = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // New loading state
  const cookies = new Cookies();
  const token = cookies.get('token');

  const processToken = async () => {
    if (token) {
      try {
        if (isTokenExpired(token)) {
          cookies.remove('token');
          resetAuthState();
        } else {
          const decoded = jwtDecode<DecodedToken>(token);
 
          setUserId(decoded.id);
          setUserRoles(decoded.roles);
          setUsername(`${decoded.name} ${decoded.lastname}`);
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        resetAuthState();
      }
    } else {
      resetAuthState();
    }
    setLoading(false); // Set loading to false after processing
  };

  const resetAuthState = () => {
    setUserId(null);
    setUserRoles([]);
    setUsername(null);
  };

  useEffect(() => {
    processToken();
  }, [token]);

  return { userId, userRoles, username, loading };
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Invalid token format:', error);
    return true;
  }
};

import { Cookies } from 'react-cookie';
import {jwtDecode} from 'jwt-decode'; // For decoding JWT tokens
import { api } from './api';

const cookies = new Cookies();

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });

    // Set the expiration date to 7 days from now
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    cookies.set('token', response.data.token, {
      path: '/',
      expires: expirationDate, // Set the expiration date
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Must be false to allow client-side access
      sameSite: 'strict',
    });

    return response;
  } catch (error) {
    console.error('Error in API request:', error);
  }
};

export const logout = () => {
  cookies.remove('token', { path: '/' });
};

export const isAuthenticated = (): boolean => {
  const token = cookies.get('token'); // Get the token from the cookies

  if (token) {
    try {
      // Decode the token to extract expiration
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Get the current time in seconds

      // Check if the token is still valid (not expired)
      if (decodedToken.exp && decodedToken.exp > currentTime) {
        return true; // Token is valid
      } else {
        // Token is expired
        logout(); // Optionally log the user out
        return false;
      }
    } catch (error) {
      console.error('Invalid token:', error);
      return false; // Invalid token
    }
  }

  return false; // No token present
};

import { Cookies } from 'react-cookie';
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

export const isAuthenticated = (): any => {
  console.log(!!cookies.get('token'))
  // return !!cookies.get('token');
};

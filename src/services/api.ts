import axios from 'axios';
import { useSessionExpiration } from '../contexts/SessionExpirationContext';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3003/api',
  withCredentials: true, // To allow sending cookies with requests
});

export const useAxiosInterceptors = () => {
  const { triggerSessionExpiration } = useSessionExpiration();

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.data?.message?.includes('TokenExpiredError')) {
        triggerSessionExpiration(); // Trigger the session expiration dialog
      }
      return Promise.reject(error);
    }
  );
};

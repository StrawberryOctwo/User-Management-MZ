import axios from 'axios';
import { useSessionExpiration } from '../contexts/SessionExpirationContext';
import { useSnackbar } from '../contexts/SnackbarContext'; // Import Snackbar context

// Create an Axios instance
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3003/api',
  withCredentials: true, // Allow sending cookies with requests
});

// Set up Axios interceptors globally
export const useAxiosInterceptors = () => {
  const { triggerSessionExpiration } = useSessionExpiration();
  const { showMessage } = useSnackbar(); // Use Snackbar context

  // Response interceptor for handling success and errors globally
  api.interceptors.response.use(
    (response) => {
      if (response.data?.message) {
        showMessage(response.data.message, 'success'); // Show success snackbar
      }
      return response;
    },
    (error) => {
      if (error.response?.data?.message?.includes('TokenExpiredError')) {
        triggerSessionExpiration(); // Trigger the session expiration dialog
      }

      // Handle error responses and show error snackbar
      const errorMessage = error.response?.data?.message || 'An error occurred';
      showMessage(errorMessage, 'error');
      return Promise.reject(error);
    }
  );
};

import { useEffect } from 'react';
import { useSessionExpiration } from '../contexts/SessionExpirationContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import { api } from './api';

// No need to use FC or expect children
export const AxiosInterceptorSetup = () => {
  const { triggerSessionExpiration } = useSessionExpiration();
  const { showMessage } = useSnackbar();

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => {
        if (response.data?.message) {
          showMessage(response.data.message, 'success'); // Show success snackbar
        }
        return response;
      },
      (error) => {
        if (error.response?.data?.message?.includes('TokenExpiredError')) {
          triggerSessionExpiration(); // Trigger session expiration logic
        }
        const errorMessage = error.response?.data?.message || 'An error occurred';
        showMessage(errorMessage, 'error'); // Show error snackbar
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors when component unmounts
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [triggerSessionExpiration, showMessage]);

  return null; // This component does not render any UI
};

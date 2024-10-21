import { useEffect } from 'react';
import { useSessionExpiration } from '../contexts/SessionExpirationContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import { api } from './api';

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
          showMessage(response.data.message, 'success');
        }
        return response;
      },
      (error) => {
        if (error.response?.data?.message?.includes('Invalid Token: JsonWebTokenError: invalid token')) {
          triggerSessionExpiration();
        }
        if (error.response?.data?.message?.includes('TokenExpiredError')) {
          triggerSessionExpiration();
        }
        const errorMessage = error.response?.data?.message || 'An error occurred';
        showMessage(errorMessage, 'error');
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [triggerSessionExpiration, showMessage]);

  return null;
};

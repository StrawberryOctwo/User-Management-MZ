import { useEffect } from 'react';
import { useSnackbar } from '../contexts/SnackbarContext';
import { api } from './api';
import { useNavigate } from 'react-router';

export const AxiosInterceptorSetup = () => {
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => {
        if (response.data?.message) {
          showMessage(response.data.message, 'success', 4000); // Default duration
        }
        return response;
      },
      (error) => {
        const errorMessage = error.response?.data?.message || 'An error occurred';

        if (
          errorMessage.includes('JsonWebTokenError: invalid token') ||
          errorMessage.includes('Invalid Token')
        ) {
          showMessage('Invalid Token', 'error', 4000); // Default duration
          navigate('/logout');
        } else if (errorMessage.includes('TokenExpiredError')) {
          showMessage('Token has expired', 'error', 4000); // Default duration
          navigate('/logout');
        } else {
          showMessage(errorMessage, 'error', 4000); // Default duration
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [showMessage, navigate]);

  return null;
};

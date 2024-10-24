import { useEffect } from 'react';
import { useSnackbar } from '../contexts/SnackbarContext';
import { api } from './api';
import { useNavigate } from 'react-router';

export const AxiosInterceptorSetup = () => {
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();

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
        const errorMessage = error.response?.data?.message || 'An error occurred';
      
        if (errorMessage.includes('JsonWebTokenError: invalid token')) {
          // Handle invalid token
          showMessage('Invalid Token', 'error');
          navigate('/logout'); // Redirect to logout
        } else if (errorMessage.includes('TokenExpiredError')) {
          // Handle expired token
          showMessage('Token has expired', 'error');
          navigate('/logout'); // Redirect to logout
        } else {
          // Handle generic error
          showMessage(errorMessage, 'error');
        }
      
        return Promise.reject(error);
      }
      
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [showMessage]);

  return null;
};

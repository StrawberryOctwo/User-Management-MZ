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
        if (error.response?.data?.message?.includes('Invalid Token: JsonWebTokenError: invalid token')) {
          navigate('/logout');
        }
        if (error.response?.data?.message?.includes('TokenExpiredError')) {
          navigate('/logout');
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
  }, [showMessage]);

  return null;
};

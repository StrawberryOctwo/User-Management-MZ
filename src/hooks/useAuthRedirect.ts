import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

const useAuthRedirect = (redirectTo: string = '/dashboard') => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(redirectTo);
    }
  }, [navigate, redirectTo]);
};

export default useAuthRedirect;

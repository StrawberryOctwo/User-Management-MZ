import axios from 'axios';
import { useSnackbar } from '../contexts/SnackbarContext'; // Import Snackbar context
import { Cookies } from 'react-cookie';

// Create an Axios instance
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3003/api',
  withCredentials: true, // Allow sending cookies with requests
});

const cookies = new Cookies();

const getToken = () => {
  return cookies.get('token');
};

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Set up Axios interceptors globally
// export const useAxiosInterceptors = () => {
//   const { showMessage } = useSnackbar();

//   api.interceptors.response.use(
//     (response) => {
//       console.log(response.data)
//       if (response.data?.message) {
//         showMessage(response.data.message, 'success');
//       }
//       return response;
//     },
//     (error) => {
//       if (error.response?.data?.message?.includes('TokenExpiredError')) {
//         triggerSessionExpiration();
//       }

//       const errorMessage = error.response?.data?.message || 'An error occurred';
//       // showMessage(errorMessage, 'error');
//       return Promise.reject(error);
//     }
//   );
// };

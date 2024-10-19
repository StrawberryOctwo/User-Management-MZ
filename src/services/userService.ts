import { Cookies } from 'react-cookie';
import { api } from './api';

// Create an instance of Cookies
const cookies = new Cookies();

// Function to get the token from cookies
const getToken = () => {
    return cookies.get('token');
};

// Add a request interceptor to include the Authorization header
api.interceptors.request.use(
    (config) => {
        const token = getToken(); // Get token from cookies
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // Set Authorization header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Fetch the logged-in user's profile details
export const fetchUserProfile = async () => {
    try {
        const response = await api.get('/user/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

// Update the user's password
export const updateUserPassword = async (passwordData: any) => {
    try {
        const response = await api.put('/user/password', passwordData);
        return response.data;
    } catch (error) {
        console.error('Error updating user password:', error);
        throw error;
    }
};

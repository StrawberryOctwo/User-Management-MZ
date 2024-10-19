import { api } from './api';
import { Cookies } from 'react-cookie';

// Create an instance of Cookies
const cookies = new Cookies();

// Function to get the token from cookies
const getToken = () => {
    return cookies.get('token');
};

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

// Fetch uploaded files
export const fetchFiles = async (page: number, limit: number, searchQuery: string = '') => {
    try {
        const response = await api.get('/files', {
            params: { page, limit, search: searchQuery },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching files:', error);
        throw error;
    }
};

// Upload a new file
export const uploadFile = async (formData: FormData) => {
    try {
        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export const addDocument = async (payload: { type: string, customFileName: string, userId: string }, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', payload.type);
    formData.append('customFileName', payload.customFileName);
    formData.append('userId', payload.userId);

    return api.post('/files/user', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// Function to delete multiple files
export const deleteFiles = async (fileIds: number[]) => {
    try {
        const response = await api.post('/files/delete', {
            ids: fileIds  // Send `ids` directly in the request body
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting files:', error);
        throw error;
    }
};




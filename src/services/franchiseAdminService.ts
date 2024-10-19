// franchiseAdminService.ts

import { api } from './api';

// Fetch franchise admins
export const fetchFranchiseAdmins = async (page: number, limit: number, searchQuery: string = '') => {
    try {
        const response = await api.get('/franchise-admins', {
            params: { page, limit, search: searchQuery },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching franchise admins:', error);
        throw error;
    }
};

export const fetchFranchiseAdminById = async (franchiseAdminId: number) => {
    try {
        const response = await api.get(`/franchise-admins/${franchiseAdminId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching franchise admin by ID:', error);
        throw error;
    }
};

// Add a new franchise admin
export const addFranchiseAdmin = async (adminData: any) => {
    try {
        const response = await api.post('/franchise-admins', adminData);
        return response.data;
    } catch (error) {
        console.error('Error adding franchise admin:', error);
        throw error;
    }
};

export const updateFranchiseAdmin = async (franchiseAdminId: number, franchiseAdminData: any) => {
    try {
        const response = await api.put(`/franchise-admins/${franchiseAdminId}`, franchiseAdminData);
        return response.data;
    } catch (error) {
        console.error('Error updating franchise admin:', error);
        throw error;
    }
};

// Function to delete multiple locations
export const deleteFranchiseAdmin = async (franchiseAdminsIds: number[]) => {
    try {
        const response = await api.post('/admins-franchises/delete', {
            ids: franchiseAdminsIds  // Send `ids` directly in the request body
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting franchise admins:', error);
        throw error;
    }
};
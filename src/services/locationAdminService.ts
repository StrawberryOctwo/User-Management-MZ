import { api } from './api';

// Fetch location admins
export const fetchLocationAdmins = async (page: number, limit: number, searchQuery: string = '') => {
    try {
        const response = await api.get('/location-admins', {
            params: { page, limit, search: searchQuery },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching location admins:', error);
        throw error;
    }
};

// Add a new location admin
export const addLocationAdmin = async (adminData: any) => {
    try {
        const response = await api.post('/location-admins', adminData);
        return response.data;
    } catch (error) {
        console.error('Error adding location admin:', error);
        throw error;
    }
};

export const updateLocationAdmin = async (locationAdminId: number, locationAdminData: any) => {
    try {
        const response = await api.put(`/location-admins/${locationAdminId}`, locationAdminData);
        return response.data;
    } catch (error) {
        console.error('Error updating location admin:', error);
        throw error;
    }
};

// Function to delete multiple location admins
export const deleteLocationAdmins = async (locationAdminIds: number[]) => {
    try {
        const response = await api.post('/admins-location/delete', {
            ids: locationAdminIds  // Send `ids` directly in the request body
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting location admins:', error);
        throw error;
    }
};


export const fetchLocationAdminById = async (adminId: number) => {
    try {
        const response = await api.get(`/location-admin/${adminId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching location admin by ID:', error);
        throw error;
    }
};
// Get locations by admin ID
export const getLocationsByAdminId = async (adminId: number) => {
    try {
        const response = await api.get(`/admin-location/${adminId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching locations by admin ID:', error);
        throw error;
    }
};

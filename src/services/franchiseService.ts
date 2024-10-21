import { api } from './api';


export const fetchFranchises = async (page: number, limit: number, searchQuery: string = '') => {
  try {
    const response = await api.get(`/franchises`, {
      params: { page, limit, search: searchQuery },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching franchises:', error);
    throw error;
  }
};

export const fetchFranchiseById = async (franchiseId: number) => {
  try {
    const response = await api.get(`/franchises/${franchiseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching franchise by ID:', error);
    throw error;
  }
};

export const addFranchise = async (franchiseData: any) => {
  try {
    const response = await api.post('/franchises', franchiseData);
    return response.data;
  } catch (error) {
    console.error('Error adding franchise:', error);
    throw error;
  }
};

export const updateFranchise = async (franchiseId: number, franchiseData: any) => {
  try {
    const response = await api.put(`/franchises/${franchiseId}`, franchiseData);
    return response.data;
  } catch (error) {
    console.error('Error updating franchise:', error);
    throw error;
  }
};

export const updateFranchiseStatus = async (franchiseId: number, status: string) => {
  try {
    const response = await api.put(`/franchises/${franchiseId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating franchise status:', error);
    throw error;
  }
};

export const deleteFranchise = async (franchiseIds: number[]) => {
  try {
    const response = await api.post('/franchises/delete', {
      ids: franchiseIds  // Send `ids` directly in the request body
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting franchise:', error);
    throw error;
  }
};

// Optional CRUD functions (updateFranchise, deleteFranchise) can be added similarly

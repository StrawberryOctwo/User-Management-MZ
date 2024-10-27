import { api } from './api';

// Function to add a new parent
export const addParent = async (parentData: any) => {
  try {
    const response = await api.post('/parent', parentData);
    return response.data;
  } catch (error) {
    console.error('Error adding parent:', error);
    throw error;
  }
};

// Function to update a parent
export const updateParent = async (parentId: number, parentData: any) => {
  try {
    const response = await api.put(`/parent/${parentId}`, parentData);
    return response.data;
  } catch (error) {
    console.error('Error updating parent:', error);
    throw error;
  }
};

// Function to fetch parents with optional pagination and search
export const fetchParents = async (page: number, limit: number, searchQuery: string = '') => {
  try {
    const response = await api.get(`/parents`, {
      params: { page, limit, search: searchQuery },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching parents:', error);
    throw error;
  }
};

// Function to assign students to a parent
export const assignStudentsToParent = async (parentId: number, studentIds: number[]) => {
  const payload = {
    parentId: parentId,
    studentIds: studentIds,
  };
  try {
    const response = await api.post(`/parent/assign-students`, payload);
    return response.data;
  } catch (error) {
    console.error('Error assigning students to parent:', error);
    throw error;
  }
};

// Function to delete multiple parents
export const deleteParents = async (parentIds: number[]) => {
  try {
    const response = await api.post('/parents/delete', {
      ids: parentIds,  // Send `ids` directly in the request body
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting parents:', error);
    throw error;
  }
};

// Function to fetch parent by ID
export const fetchParentById = async (id: number) => {
  try {
    const response = await api.get(`/parent/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching parent details:', error);
    throw error;
  }
};
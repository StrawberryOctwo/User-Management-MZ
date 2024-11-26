// src/services/interestService.ts

import { api } from './api';

// Fetch all interests with pagination and optional search
export const fetchInterests = async (
  page: number = 1,
  limit: number = 10,
  searchQuery: string = ''
) => {
  try {
    const response = await api.get(`/interests`, {
      params: { page, limit, search: searchQuery }, // Include search query in the request
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching interests:', error);
    throw error;
  }
};

// Fetch a single interest by ID
export const fetchInterestById = async (id: number) => {
  try {
    const response = await api.get(`/interests/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching interest details:', error);
    throw error;
  }
};

// Create a new interest
export const addInterest = async (interestData: any) => {
  try {
    const response = await api.post('/interests', interestData);
    return response.data;
  } catch (error) {
    console.error('Error adding interest:', error);
    throw error;
  }
};

// Delete interests by IDs
export const deleteInterests = async (interestIds: number[]) => {
  try {
    const response = await api.post('/interests/delete', {
      ids: interestIds, // Send ids directly
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting interests:', error);
    throw error;
  }
};

// Update an interest by ID
export const updateInterest = async (
  id: number,
  updatedData: any
) => {
  try {
    const response = await api.put(`/interests/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error('Error updating interest:', error);
    throw error;
  }
};
export const toggleAcceptedStatus = async (id: number) => {
  try {
    const response = await api.patch(`/interests/${id}/toggle-accepted`);
    return response.data;
  } catch (error) {
    console.error('Error toggling accepted status:', error);
    throw error;
  }
};
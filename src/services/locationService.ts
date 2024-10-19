import { api } from './api';

// Function to add a new location
export const addLocation = async (locationData: any) => {
  try {
    const response = await api.post('/location', locationData);
    return response.data;
  } catch (error) {
    console.error('Error adding location:', error);
    throw error;
  }
};

export const updateLocation = async (locationId: number, locationData: any) => {
  try {
      const response = await api.put(`/location/${locationId}`, locationData);
      return response.data;
  } catch (error) {
      console.error('Error updating location :', error);
      throw error;
  }
};

export const fetchLocations = async (page: number, limit: number, searchQuery: string = '') => {
  try {
    const response = await api.get(`/locations`, {
      params: { page, limit, search: searchQuery },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};


export const assignTeacherToLocations = async (teacherId: number, locationIds: number[]) => {
  var payload = {
    'teacherId': teacherId,
    'locationIds': locationIds
  };
  try {
    const response = await api.post(`/location/assign-teacher`, payload);
    return response.data;
  } catch (error) {
    console.error('Error adding location:', error);
    throw error;
  }
};


// Function to delete multiple locations
export const deleteLocation = async (locationIds: number[]) => {
  try {
    const response = await api.post('/locations/delete', {
      ids: locationIds  // Send `ids` directly in the request body
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting locations:', error);
    throw error;
  }
};


// In your locationService.ts or similar file
export const fetchLocationById = async (id: number) => {
  try {
    const response = await api.get(`/location/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching location details:', error);
    throw error;
  }
};


export const fetchLocationsByFranchise = async (franchiseId: number, searchQuery: string = '') => {
  try {
    const response = await api.get(`/locations/franchise/${franchiseId}`, {
      params: { search: searchQuery },
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching locations for franchise:', error);
    throw error;
  }
};


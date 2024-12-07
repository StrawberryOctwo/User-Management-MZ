import { api } from './api';

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
export const updateUserPassword = async (oldPassword: string, newPassword: string) => {
  const body = {
    oldPassword,
    newPassword
  }
  try {
    const response = await api.post('/user/change-password', body);
    return response.data;
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData: any) => {
  try {
    const response = await api.put(`/user/profile`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

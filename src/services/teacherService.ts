import { api } from './api';

export const fetchTeachers = async (
  page: number,
  limit: number,
  searchQuery: string = ''
) => {
  try {
    const response = await api.get(`/teachers`, {
      params: { page, limit, search: searchQuery }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }
};

export const addTeacher = async (teacherData: any) => {
  try {
    const response = await api.post('/teacher', teacherData);
    return response.data;
  } catch (error) {
    console.error('Error adding teacher:', error);
    throw error;
  }
};

export const updateTeacher = async (
  id: number,
  userData: any,
  teacherData: any
) => {
  try {
    const payload = {
      user: userData,
      teacher: teacherData
    };

    // Send the combined data as a PUT request to the backend
    const response = await api.put(`/teacher/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating teacher:', error);
    throw error;
  }
};

export const deleteTeacher = async (teacherIds: number[]) => {
  try {
    const response = await api.post('/teachers/delete', {
      ids: teacherIds // Directly sending ids without additional data wrapper
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting teachers:', error);
    throw error;
  }
};

export const fetchTeacherById = async (id: number) => {
  try {
    const response = await api.get(`/teacher/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher details:', error);
    throw error;
  }
};

export const fetchTeacherByUserId = async (id: number) => {
  try {
    const response = await api.get(`/teacher/user/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher details:', error);
    throw error;
  }
};

export const fetchTeacherDocumentsById = async (id: number) => {
  try {
    const response = await api.get(`/teachers/${id}/documents`);
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher documents:', error);
    throw error;
  }
};

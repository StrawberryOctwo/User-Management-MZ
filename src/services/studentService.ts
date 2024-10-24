import { api } from './api';



export const fetchStudents = async (page: number, limit: number, searchQuery: string = '') => {
    try {
        const response = await api.get(`/students`, {
            params: { page, limit, search: searchQuery }, // Include search query in the request
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching students:', error);
        throw error;
    }
};

export const addStudent = async (studentData: any) => {
    try {
        const response = await api.post('/student', studentData);
        return response.data;
    } catch (error) {
        console.error('Error adding student:', error);
        throw error;
    }
};


export const deleteStudent = async (studentIds: number[]) => {
    try {
        const response = await api.post('/students/delete', {
            ids: studentIds, // Send ids directly
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting students:', error);
        throw error;
    }
};

export const fetchStudentById = async (id: number) => {
    try {
        const response = await api.get(`/student/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching student details:', error);
        throw error;
    }
};

export const fetchStudentDocumentsById = async (id: number) => {
    try {
        const response = await api.get(`/students/${id}/documents`);
        return response.data;
    } catch (error) {
        console.error('Error fetching student documents:', error);
        throw error;
    }
};

export const updateStudent = async (id: number, parentPayload: any, userData: any, studentData: any) => {
    try {
        const payload = {
            parent: parentPayload,
            user: userData,
            student: studentData,
        };

        // Send the combined data as a PUT request to the backend
        const response = await api.put(`/student/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error('Error updating student:', error);
        throw error;
    }
};

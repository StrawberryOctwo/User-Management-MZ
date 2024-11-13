import { api } from './api'; // Assuming you have an API instance

export const createAbsence = async (studentId: number, classSessionId: number) => {
    try {
        const response = await api.post('/students/absences', {
            studentId,
            classSessionId
        });
        return response.data;
    } catch (error) {
        console.error('Error creating absence:', error);
        throw error;
    }
};
export const updateAbsenceReason = async (absenceId: number, reason: string) => {
    try {
        const response = await api.patch('/students/absences/update-reason', {
            absenceId,
            reason
        });
        return response.data;
    } catch (error) {
        console.error('Error updating absence reason:', error);
        throw error;
    }
};


export const deleteAbsence = async (absenceId: number) => {
    try {
      const response = await api.delete(`/students/absences/${absenceId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete absence:', error);
      throw error;
    }
  };
export const updateAbsenceStatus = async (absenceId: number, status: boolean) => {
    try {
        const response = await api.patch('/students/absences/update-status', {
            absenceId,
            status
        });
        return response.data;
    } catch (error) {
        console.error('Error updating absence status:', error);
        throw error;
    }
};
export const fetchAbsenceById = async (id) => {
    try {
        const response = await api.get(`/absences/user/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching absence by ID:', error);
        throw error;
    }
};

export const assignFilesToAbsence = async (absenceId, fileIds) => {
    try {
        const response = await api.post(`/absences/${absenceId}/assign-files`, { fileIds });
        return response.data;
    } catch (error) {
        console.error('Error assigning files to absence:', error);
        throw error;
    }
};
export const getSelfAbsences = async (page = 1, limit = 10, editable = false) => {
    try {
        const response = await api.get(`/absences/self`, {
            params: { page, limit, editable },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching self absences:', error);
        throw error;
    }
};
export const getAbsenceDetails = async (studentId, sessionId) => {
    try {
        const response = await api.get(`/student/${studentId}/class-session/${sessionId}/absence`); // POST request to /absences
        return response.data;
    } catch (error) {
        console.error('Error adding absences:', error);
        throw error;
    }
};
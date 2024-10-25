import { api } from "./api";

export const fetchClassSessions = async (startDate: string, endDate: string, locationIds: number | number[]) => {
    try {
      const response = await api.get(`/class-sessions`, {
        params: { 
          startDate, 
          endDate, 
          locationId: Array.isArray(locationIds) ? locationIds.join(',') : locationIds 
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching class sessions:', error);
      throw error;
    }
  };
  
export const fetchUserClassSessions = async (id: string, startDate: string, endDate: string) => {
    try {
        const response = await api.get(`/user/${id}/class-sessions`, {
            params: { startDate, endDate },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching User class sessions:', error);
        throw error;
    }
};
export const addClassSessions = async (classData: any) => {
    try {
        const response = await api.post('/class-session', classData)
        return response.data
    } catch (error) {
        console.error('Error adding Class Session', error)
        throw error
    }
}

export const fetchClassSessionById = async (id: string) => {
    try {
        const response = await api.get(`/class-session/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching class session with id ${id}:`, error);
        throw error;
    }
};

export const updateClassSession = async (id: string, updatedData: any) => {
    try {
        const response = await api.put(`/class-session/${id}`, updatedData);
        return response.data;
    } catch (error) {
        console.error(`Error updating class session with id ${id}:`, error);
        throw error;
    }
};
export const getClassSessionReportsStatus = async (classSessionId: string) => {
    try {
        const response = await api.get(`/session-reports/status/class-session/${classSessionId}`);
        return response.data;  // Access the data directly
    } catch (error) {
        console.error(`Error fetching session report status for class session ${classSessionId}:`, error);
        throw error;
    }
};

export const getStudentSessionReportStatus = async (classSessionId: string, studentId: string) => {
    try {
        const response = await api.get(`/session-reports/status/class-session/${classSessionId}/student/${studentId}`);
        return response.data;  // Access the data directly
    } catch (error) {
        console.error(`Error fetching session report status for student ${studentId}:`, error);
        throw error;
    }
};

export const deleteClassSession = async (classSessionId: number[]) => {
    try {
        const response = await api.post('/class-sessions/delete', {
            ids: classSessionId  // Send `ids` directly in the request body
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting Class Session:', error);
        throw error;
    }
};
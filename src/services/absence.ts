import { api } from './api'; // Assuming you have an API instance

export const createOrUpdateAbsences = async (absenceData: {
    studentIds: number[];
    classSessionId: string;
    reason: string;
    proof: string;
    status: boolean;
    absenceId: number
}) => {
    try {
        const response = await api.post('students/absences', absenceData); // POST request to /absences
        return response.data;
    } catch (error) {
        console.error('Error adding absences:', error);
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
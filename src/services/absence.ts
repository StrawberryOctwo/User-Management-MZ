import { api } from './api'; // Assuming you have an API instance

export const createAbsences = async (absenceData: {
    studentIds: number[];
    classSessionId: string;
    reason: string;
    proof: string;
    status: string;
}) => {
    try {
        const response = await api.post('students/absences', absenceData); // POST request to /absences
        return response.data;
    } catch (error) {
        console.error('Error adding absences:', error);
        throw error;
    }
};
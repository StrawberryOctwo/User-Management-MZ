import { api } from "./api";

export const fetchSchoolTypes = async () => {
    try {
        const response = await api.get('/school-types'); // Adjust endpoint if necessary
        return response.data;
    } catch (error) {
        console.error('Error fetching school types:', error);
        throw error;
    }
};

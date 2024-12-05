import { api } from './api'; 


export const fetchFranchiseCount = async (franchiseId?: string) => {
    try {
        const response = await api.get(`/dashboard/franchises/count`, {
            params: { franchiseId },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching Franchise Count:', error);
        throw error;
    }
};
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

export const fetchSessionAnalytics = async (filter = 'month', franchiseId = null) => {
    try {
        const response = await api.get('/dashboard/session-analytics', { params: { filter, franchiseId } });
        return response.data;
    } catch (error) {
        console.error('Error fetching session analytics:', error);
        throw error;
    }
};

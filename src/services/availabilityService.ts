import { api } from './api';

// Fetch availability for a specific teacher by teacher ID
export const fetchAvailabilityByTeacherId = async (teacherId: number) => {
    try {
        const response = await api.get(`/teachers/${teacherId}/availability`);
        return response.data;
    } catch (error) {
        console.error('Error fetching availability for teacher:', error);
        throw error;
    }
};

// Fetch availability for the authenticated teacher (uses `self` route)
export const fetchAvailabilityForSelf = async () => {
    try {
        const response = await api.get('/teachers/self/availability');
        return response.data;
    } catch (error) {
        console.error('Error fetching own availability:', error);
        throw error;
    }
};

// Update availability for the authenticated teacher
export const updateAvailabilityForSelf = async (availabilityId: number, availabilityData: { dayOfWeek: string, startTime: string, endTime: string }) => {
    try {
        const response = await api.put(`/teachers/self/availability/${availabilityId}`, availabilityData);
        return response.data;
    } catch (error) {
        console.error('Error updating availability:', error);
        throw error;
    }
};

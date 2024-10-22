import { api } from "./api";

// Create payment for student when session report is completed
export const createPaymentForUser = async ({ amount, userId, classSessionId }) => {
    try {
        const response = await api.post('/payments/', { amount, userId, classSessionId });
        return response.data;
    } catch (error) {
        console.error('Error creating payment for user:', error);
        throw error;
    }
};

// Update payment status (pending to paid)
export const updatePaymentStatus = async (paymentId, status) => {
    try {
        const response = await api.put(`/payments/${paymentId}`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating payment status:', error);
        throw error;
    }
};

export const getStudentPaymentDetails = async (studentId: string) => {
    try {
        const response = await api.get(`/student-payments/${studentId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching student payment details:', error);
        throw error;
    }
};

// Fetch payments for a student
export const getPaymentsForUser = async (userId) => {
    try {
        const response = await api.get(`/payments/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching payments for user:', error);
        throw error;
    }
};

// Fetch payments for a student
export const getPaymentsForUserByClassSession = async (userId,classSessionId) => {
    try {
        const response = await api.get(`/payments/user/${userId}/session/${classSessionId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching payments for user:', error);
        throw error;
    }
};
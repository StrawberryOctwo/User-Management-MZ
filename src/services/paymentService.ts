import { api } from "./api";

// Create payment for student when session report is completed



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

export const getParentPayments = async (userId:number,page = 1, limit = 10,  search: string = '',) => {
    try {
        const response = await api.get(`/parent-payments/${userId}`, {
            params: { page, limit,search }
          });
        return response.data;
    } catch (error) {
        console.error('Error fetching parent payment details:', error);
        throw error;
    }
};

// Fetch payments for a user with pagination
export const getPaymentsForUser = async (userId:number, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/payments/user/${userId}`, {
        params: { page, limit }
      });
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
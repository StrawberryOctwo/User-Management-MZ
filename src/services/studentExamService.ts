import { api } from './api';

export const fetchExamsForSelf = async (page: number, limit: number) => {
  try {
    const response = await api.get('/student-exams/self', { params: { page, limit } });
    return response.data;
  } catch (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }
};

export const addExamForSelf = async (examData: { examName: string; grade: string }) => {
  try {
    const response = await api.post('/student-exams/self', examData);
    return response.data;
  } catch (error) {
    console.error('Error adding exam:', error);
    throw error;
  }
};

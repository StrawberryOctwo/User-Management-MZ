import { api } from './api'; // Replace with your actual API instance

// Create a new survey with questions
export const createSurvey = async (title: string, questions: { text: string, type: string, options: string[] }[]) => {
    try {
        const response = await api.post('/survey', { title, questions });
        return response.data;
    } catch (error) {
        console.error('Error creating survey:', error);
        throw error;
    }
};

// Fetch all surveys with pagination
export const fetchAllSurveys = async (page: number = 1, limit: number = 10) => {
    try {
        const response = await api.get('/surveys', {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching surveys:', error);
        throw error;
    }
};

// Fetch a survey by ID
export const fetchSurveyById = async (surveyId: number) => {
    try {
        const response = await api.get(`/survey/${surveyId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching survey by ID:', error);
        throw error;
    }
};

export const skipSurveyForSelf = async (surveyId: number) => {
    try {
        const response = await api.patch('/survey/self/skip', { surveyId });
        return response.data;
    } catch (error) {
        console.error('Error skipping survey:', error);
        throw error;
    }
};

// Update a survey by ID, including updating questions
export const updateSurvey = async (surveyId: number, title: string, questions: { text: string, type: string, options: string[] }[]) => {
    try {
        const response = await api.put(`/survey/${surveyId}`, { title, questions });
        return response.data;
    } catch (error) {
        console.error('Error updating survey:', error);
        throw error;
    }
};

// Delete a survey by ID
export const deleteSurvey = async (surveyId: number) => {
    try {
        const response = await api.delete(`/surveys/${surveyId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting survey:', error);
        throw error;
    }
};

// Submit survey responses (this example assumes a separate endpoint for responses)
export const getSurveysForSelf = async (page = 1, limit = 10) => {
    try {
        const response = await api.get('/surveys/self', {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching surveys for self:', error);
        throw error;
    }
};
  
  // Submit answers for a survey for the authenticated user
  export const submitSurveyForSelf = async (surveyId: number, answers: { questionId: number; answer: string | string[] }[]) => {
    try {
      const response = await api.post('/surveys/self/submit', {
        surveyId,
        answers,
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting survey for self:', error);
      throw error;
    }
  };

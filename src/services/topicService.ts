import { api } from "./api";

export const fetchTopics = async (page: number, limit: number, searchQuery: string = '', fields?: string) => {
    try {
        const response = await api.get(`/topics`, {
            params: { page, limit, search: searchQuery, fields },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching topics:', error);
        throw error;
    }
};


export const assignTeacherToTopics = async (teacherId: number, topicIds: number[]) => {
    var payload = {
        'teacherId': teacherId,
        'topicIds': topicIds
    };
    try {
        const response = await api.post(`/topics/assign-teacher`, payload);
        return response.data;
    } catch (error) {
        console.error('Error adding topic:', error);
        throw error;
    }
};

export const assignStudentToTopics = async (studentId: number, topicIds: number[]) => {
    var payload = {
        'studentId': studentId,
        'topicIds': topicIds
    };
    try {
        const response = await api.post(`/topics/assign-student`, payload);
        return response.data;
    } catch (error) {
        console.error('Error adding topic:', error);
        throw error;
    }
};

export const addTopic = async (topicData: any) => {
    try {
        const response = await api.post('/topic', topicData);
        return response.data;
    } catch (error) {
        console.error('Error adding topic:', error);
        throw error;
    }
};


export const updateTopic = async (topicId: number, topicData: any) => {
    try {
        const response = await api.put(`/topic/${topicId}`, topicData);
        return response.data;
    } catch (error) {
        console.error('Error updating topic:', error);
        throw error;
    }
};


export const fetchTopicById = async (id: number) => {
    try {
        const response = await api.get(`/topic/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching topic details:', error);
        throw error;
    }
};


export const deleteTopic = async (topicIds: number) => {
    try {
        const response = await api.post('/topic/delete', {
            id: topicIds, // Directly sending ids without additional data wrapper
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting topics:', error);
        throw error;
    }
};
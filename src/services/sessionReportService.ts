import { SessionReportData } from "src/components/Calendar/Components/Modals/SessionReportData";
import { api } from "./api";

// Add a new session report
export const addSessionReport = async (reportData:SessionReportData) => {
    try {
        const response = await api.post('/session-reports', reportData);
        return response.data;
    } catch (error) {
        console.error(`Error adding session report:`, error);
        throw error;
    }
};

// Get session report by ID
export const getSessionReportById = async (reportId: string) => {
    try {
        const response = await api.get(`/session-reports/${reportId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching session report with id ${reportId}:`, error);
        throw error;
    }
};

// Update session report by ID
export const updateSessionReport = async (reportId: string, updatedData: any) => {
    try {
        const response = await api.put(`/session-reports/${reportId}`, updatedData);
        return response.data;
    } catch (error) {
        console.error(`Error updating session report with id ${reportId}:`, error);
        throw error;
    }
};

// Delete session report by ID
export const deleteSessionReport = async (reportId: string) => {
    try {
        const response = await api.delete(`/session-reports/${reportId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting session report with id ${reportId}:`, error);
        throw error;
    }
};

export const getSessionReportsForStudent = async (studentId: string) => {
    try {
        const response = await api.get(`/students/${studentId}/session-reports`);
        return response.data.sessionReports; // Return session reports
    } catch (error) {
        console.error('Error fetching session reports:', error);
        throw error;
    }
};
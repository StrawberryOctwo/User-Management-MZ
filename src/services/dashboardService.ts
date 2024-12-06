import { api } from './api';

export const fetchFranchiseCount = async (franchiseId?: string) => {
  try {
    const response = await api.get(`/dashboard/franchises/count`, {
      params: { franchiseId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Franchise Count:', error);
    throw error;
  }
};

export const fetchSessionAnalytics = async (
  filter = 'month',
  franchiseId = null
) => {
  try {
    const response = await api.get('/dashboard/session-analytics', {
      params: { filter, franchiseId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching session analytics:', error);
    throw error;
  }
};

export const fetchInvoiceAnalytics = async (
  franchiseId,
  filter = 'month',
  filterParams = {}
) => {
  try {
    const params = { franchiseId, filter, ...filterParams };

    const response = await api.get('/dashboard/invoice-analytics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice analytics:', error);
    throw error;
  }
};

export const fetchUserAnalytics = async (
  franchiseId: string,
  userType: string,
  period = 'month'
) => {
  try {
    const params = { franchiseId, period, userType };

    const response = await api.get('/dashboard/user-analytics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice analytics:', error);
    throw error;
  }
};

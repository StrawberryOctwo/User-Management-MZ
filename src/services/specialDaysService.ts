import { api } from './api';

export interface Holiday {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  locationId: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface HolidayInput {
  name: string;
  start_date: string;
  end_date: string;
}

export const fetchHolidaysByLocationIds = async (
  locationIds?: number[],
  page?: number,
  limit?: number,
  search?: string
) => {
  // Build the payload dynamically, excluding undefined values
  const payload: Record<string, any> = {};
  if (locationIds) payload.locationIds = locationIds;
  if (page) payload.page = page;
  if (limit) payload.limit = limit;
  if (search) payload.search = search;

  try {
    const response = await api.post('/holidays', payload);
    return response.data;
  } catch (error) {
    console.error('Error fetching holidays by location:', error);
    throw error;
  }
};

export const fetchHolidayById = async (id: number) => {
  try {
    const response = await api.get(`/holiday/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching holiday:', error);
    throw error;
  }
};

// Add a holiday
export const addHoliday = async (holidayData: HolidayInput) => {
  try {
    const response = await api.post('/holiday', holidayData);
    return response.data;
  } catch (error) {
    console.error('Error adding holiday:', error);
    throw error;
  }
};

// Update a holiday
export const updateHoliday = async (id: number, holidayData: HolidayInput) => {
  try {
    const response = await api.put(`/holiday/${id}`, holidayData);
    return response.data;
  } catch (error) {
    console.error('Error updating holiday:', error);
    throw error;
  }
};

// Delete a holiday
export const deleteHoliday = async (ids: number[]) => {
  const id = ids[0];
  try {
    const response = await api.delete('/holiday', {
      data: { id }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting holiday:', error);
    throw error;
  }
};

// Add a closing day (uses same endpoint as holiday but marks it as a closing day)
export const addClosingDay = async (closingDayData: HolidayInput) => {
  try {
    const response = await api.post('/closing-day', closingDayData);
    return response.data;
  } catch (error) {
    console.error('Error adding closing day:', error);
    throw error;
  }
};

// Update a closing day
export const updateClosingDay = async (
  id: number,
  closingDayData: HolidayInput
) => {
  try {
    const response = await api.put(`/closing-day/${id}`, closingDayData);
    return response.data;
  } catch (error) {
    console.error('Error updating closing day:', error);
    throw error;
  }
};

// Delete a closing day
export const deleteClosingDay = async (ids: number[]) => {
  const id = ids[0];
  try {
    const response = await api.delete('/closing-day', {
      data: { id }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting holiday:', error);
    throw error;
  }
};

export const fetchClosingDayById = async (id: number) => {
  try {
    const response = await api.get(`/closing-day/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching closing day:', error);
    throw error;
  }
};

// Updated to accept locationIds
export const fetchClosingDays = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<PaginatedResponse<Holiday>> => {
  try {
    const response = await api.get('/closing-days', {
      params: {
        page,
        limit,
        search
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching closing days:', error);
    throw error;
  }
};

export const fetchClosingDaysByLocationIds = async (
  locationIds?: number[],
  page?: number,
  limit?: number,
  search?: string
) => {
  const payload: Record<string, any> = {};
  if (locationIds) payload.locationIds = locationIds;
  if (page) payload.page = page;
  if (limit) payload.limit = limit;
  if (search) payload.search = search;

  try {
    const response = await api.post('/closing-days', payload);
    return response.data;
  } catch (error) {
    console.error('Error fetching closing days by location:', error);
    throw error;
  }
};
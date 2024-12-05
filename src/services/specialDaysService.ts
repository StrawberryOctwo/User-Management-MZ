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

const getYearDateRange = (year?: number) => {
  const targetYear = year || new Date().getFullYear();
  return {
    startDate: `${targetYear}-01-01`,
    endDate: `${targetYear}-12-31`
  };
};

export const fetchHolidaysByLocationIds = async (
  locationIds?: number[],
  year?: number,
  page?: number,
  limit?: number,
  search?: string
) => {
  const { startDate, endDate } = getYearDateRange(year);
  const payload: Record<string, any> = {};

  if (locationIds) payload.locationIds = locationIds;
  if (page) payload.page = page;
  if (limit) payload.limit = limit;
  if (search) payload.search = search;

  try {
    const response = await api.post('/holidays', payload, {
      params: {
        startDate,
        endDate
      }
    });
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
  year?: number,
  page?: number,
  limit?: number,
  search?: string
) => {
  const { startDate, endDate } = getYearDateRange(year);
  const payload: Record<string, any> = {};

  if (locationIds) payload.locationIds = locationIds;
  if (page) payload.page = page;
  if (limit) payload.limit = limit;
  if (search) payload.search = search;

  try {
    const response = await api.post('/closing-days', payload, {
      params: {
        startDate,
        endDate
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching closing days by location:', error);
    throw error;
  }
};


export const updateSpecialDaysStorage = async (locationIds: number[], year: number) => {
  const HOLIDAYS_STORAGE_KEY = 'calendarHolidays';
  const CLOSING_DAYS_STORAGE_KEY = 'calendarClosingDays';

  try {
    // Fetch both holidays and closing days for the specified year
    const [holidaysResponse, closingDaysResponse] = await Promise.all([
      fetchHolidaysByLocationIds(locationIds, year),
      fetchClosingDaysByLocationIds(locationIds, year)
    ]);

    // Update localStorage with the year-specific data
    localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(holidaysResponse.data));
    localStorage.setItem(CLOSING_DAYS_STORAGE_KEY, JSON.stringify(closingDaysResponse.data));

    return {
      holidays: holidaysResponse.data,
      closingDays: closingDaysResponse.data
    };
  } catch (error) {
    console.error('Error updating special days storage:', error);
    throw error;
  }
};
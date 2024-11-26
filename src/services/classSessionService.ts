import { api } from './api';

export const fetchClassSessions = async (
  startDate: string,
  endDate: string,
  locationIds: number | number[]
) => {
  try {
    const response = await api.get(`/class-sessions`, {
      params: {
        startDate,
        endDate,
        locationId: Array.isArray(locationIds)
          ? locationIds.join(',')
          : locationIds
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching class sessions:', error);
    throw error;
  }
};

export const fetchUserClassSessions = async (
  id: string,
  startDate: string,
  endDate: string
) => {
  try {
    const response = await api.get(`/user/${id}/class-sessions`, {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching User class sessions:', error);
    throw error;
  }
};

export const fetchParentClassSessions = async (
  parentUserId: string,
  startDate?: string,
  endDate?: string
) => {
  try {
    const response = await api.get(`/parent/${parentUserId}/class-sessions`, {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Parent class sessions:', error);
    throw error;
  }
};

export const addClassSession = async (classData: any) => {
  try {
    const response = await api.post('/class-session', classData);
    return response.data;
  } catch (error) {
    console.error('Error adding Class Session', error);
    throw error;
  }
};

export const fetchClassSessionById = async (id: string) => {
  try {
    const response = await api.get(`/class-session/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching class session with id ${id}:`, error);
    throw error;
  }
};

export const updateClassSession = async (id: string, updatedData: any) => {
  try {
    const response = await api.put(`/class-session/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(`Error updating class session with id ${id}:`, error);
    throw error;
  }
};

export const submitTeacherReports = async (classSessionId: any) => {
  try {
    const response = await api.patch(
      `/session-reports/class-session/teacher/submit`,
      classSessionId
    );
    return response.data;
  } catch (error) {
    console.error(`Error submitting reports:`, error);
    throw error;
  }
};

export const updateClassSessionFromTo = async (
  id: string,
  updatedData: any
) => {
  try {
    const response = await api.put(`/class-session/from-to/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(`Error updating class session with id ${id}:`, error);
    throw error;
  }
};

export const updateSessionInstance = async (id: string, updatedData: any) => {
  try {
    const response = await api.put(`/session-instance/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(`Error updating class session with id ${id}:`, error);
    throw error;
  }
};

export const getClassSessionReportsStatus = async (classSessionId: string) => {
  try {
    const response = await api.get(
      `/session-reports/status/class-session/${classSessionId}`
    );
    return response.data; // Access the data directly
  } catch (error) {
    console.error(
      `Error fetching session report status for class session ${classSessionId}:`,
      error
    );
    throw error;
  }
};

export const getStudentSessionReportStatus = async (
  classSessionId: string,
  studentId: string
) => {
  try {
    const response = await api.get(
      `/session-reports/status/class-session/${classSessionId}/student/${studentId}`
    );
    return response.data; // Access the data directly
  } catch (error) {
    console.error(
      `Error fetching session report status for student ${studentId}:`,
      error
    );
    throw error;
  }
};

export const deleteClassSession = async (classSessionId: number[]) => {
  try {
    const response = await api.post('/class-sessions/delete', {
      ids: classSessionId // Send `ids` directly in the request body
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting Class Session:', error);
    throw error;
  }
};

export async function toggleClassSessionActivation(
  ids: string,
  isActive: boolean
) {
  try {
    const response = await api.post('/class-sessions/toggle-activation', {
      id: ids,
      isActive: isActive
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting Class Session:', error);
    throw error;
  }
}

export interface Holiday {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
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

// Fetch holidays
// export const fetchHolidays = async (
//   page: number = 1,
//   limit: number = 10,
//   search?: string
// ): Promise<PaginatedResponse<Holiday>> => {
//   try {
//     const response = await api.get('/holidays', {
//       params: {
//         page,
//         limit,
//         search
//       }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching holidays:', error);
//     throw error;
//   }
// };

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

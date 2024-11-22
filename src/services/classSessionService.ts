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

// Fetch holidays
export const fetchHolidays = async (ids: number[]) => {
  try {
    const response = await api.post('/getHolidaysByLocationIds', ids);
    return response.data;
  } catch (error) {
    console.error('Error fetching holidays:', error);
    throw error;
  }
};

// Updated to accept locationIds
export const fetchClosingDays = async (locationIds: number[]) => {
  try {
    const response = await api.post('/getClosingDaysByLocationIds', locationIds);
    return response.data;
  } catch (error) {
    console.error('Error fetching closing days:', error);
    throw error;
  }
};

// Mock data for development
export const mockHolidays: Holiday[] = [
  {
    id: 1,
    name: 'Thanksgiving',
    start_date: '2024-11-28', // Current test date
    end_date: '2024-11-28',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null
  },
  {
    id: 2,
    name: 'Christmas',
    start_date: '2024-12-24',
    end_date: '2024-12-26',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null
  }
];

export const mockClosingDays: Holiday[] = [
  {
    id: 3,
    name: 'Staff Training',
    start_date: '2024-11-28', // Current test date
    end_date: '2024-11-28',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null
  },
  {
    id: 4,
    name: 'Maintenance Day',
    start_date: '2024-11-25',
    end_date: '2024-11-25',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null
  }
];

interface HolidayInput {
  name: string;
  start_date: string;
  end_date: string;
}

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
export const deleteHoliday = async (id: number) => {
  try {
    const response = await api.delete(`/holiday/${id}`);
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
export const deleteClosingDay = async (id: number) => {
  try {
    const response = await api.delete(`/closing-day/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting closing day:', error);
    throw error;
  }
};

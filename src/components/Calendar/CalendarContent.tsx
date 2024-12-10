import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CustomizedCalendar from './Components/CustomizedCalendar/CustomizedCalendar';
import moment from 'moment';
import { EventItem } from './types';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from 'src/hooks/useAuth';
import { getStrongestRoles } from 'src/hooks/roleUtils';
import {
  fetchClassSessions,
  fetchParentClassSessions,
  fetchUserClassSessions
} from 'src/services/classSessionService';
import { calendarsharedService } from './CalendarSharedService';
import {
  Holiday,
  fetchClosingDaysByLocationIds,
  fetchHolidaysByLocationIds
} from 'src/services/specialDaysService';
import FilterToolbar from './Components/CustomizedCalendar/FilterToolbar';

const CalendarContent: React.FC = () => {
  const HOLIDAYS_STORAGE_KEY = 'calendarHolidays';
  const CLOSING_DAYS_STORAGE_KEY = 'calendarClosingDays';

  const [selectedFranchise, setSelectedFranchise] = useState<any | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<any[]>([]);

  const [currentViewYear, setCurrentViewYear] = useState<number>(
    new Date().getFullYear()
  );
  const [classSessionEvents, setClassSessionEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [closingDays, setClosingDays] = useState<Holiday[]>([]);
 
 
  const [date, setDate] = useState<string>(() => moment().toLocaleString());
  const [strongestRole, setStrongestRole] = useState<string | null>(null);
  const [parentNbOfRooms, setParentNbOfRooms] = useState<number>(0);
  const { userId, userRoles } = useAuth();

  useEffect(() => {
    if (userRoles) {
      const roles = getStrongestRoles(userRoles);
      const role = roles.includes('SuperAdmin')
        ? 'SuperAdmin'
        : roles.includes('FranchiseAdmin')
        ? 'FranchiseAdmin'
        : roles.includes('LocationAdmin')
        ? 'LocationAdmin'
        : roles.includes('Teacher')
        ? 'Teacher'
        : roles.includes('Parent')
        ? 'Parent'
        : roles.includes('Student')
        ? 'Student'
        : null;
      setStrongestRole(role);
    }
  }, [userRoles]);

  useEffect(() => {
    const savedFranchise = localStorage.getItem('selectedFranchise');
    const savedLocations = localStorage.getItem('selectedLocations');

    if (savedFranchise) {
      setSelectedFranchise(JSON.parse(savedFranchise));
    }
    if (savedLocations) {
      const parsedLocations = JSON.parse(savedLocations);
      setSelectedLocations(parsedLocations);
      fetchSpecialDays(parsedLocations);
    }
  }, []);

  useEffect(() => {
    const onAbsenceUpdated = () => {
      const storedLocations = JSON.parse(
        localStorage.getItem('selectedLocations') || '[]'
      );
      if (storedLocations.length > 0) {
        setSelectedLocations(storedLocations);
      }
      loadClassSessions(storedLocations);
      fetchSpecialDays(storedLocations);
    };

    calendarsharedService.on('absenceUpdated', onAbsenceUpdated);

    return () => {
      calendarsharedService.off('absenceUpdated', onAbsenceUpdated);
    };
  }, []);

  const transformClassSessionsToEvents = (
    classSessions: any[]
  ): EventItem[] => {
    // console.log('classSessions:', classSessions);
    if (classSessions === undefined) return [];
    return classSessions.map((session) => {
      const resource = session.room || 'R2';

      const studentsWithStatus = session.students.map(
        (student: {
          firstName: string;
          gradeLevel: string;
          abscenceStatus: boolean;
        }) => ({
          firstName: student.firstName,
          gradeLevel: student.gradeLevel,
          absenceStatus: student.abscenceStatus
        })
      );

      return {
        data: {
          appointment: {
            id: session.id,
            sessionId: session.sessionId,
            isHolidayCourse: session.isHoliday,
            status: session.status,
            location: session.location?.name || 'Unknown Location',
            topic: session.topic?.name || 'Unknown Topic',
            resource: session.room || 'Unknown Teacher',
            address: session.location || 'Unknown address',
            className: session.room,
            teacher: session.teacherName,
            studentCount: session.students.length,
            students: studentsWithStatus,
            startTime: session.startTime,
            endTime: session.endTime,
            sessionType: session.sessionType,
            reportStatus: session.reportStatus,
            date: session.date
          }
        },
        resourceId: resource
      };
    });
  };

  const loadClassSessions = async (locations = selectedLocations) => {
    console.log('Loading class sessions for date:', date);
    setLoading(true);
    setErrorMessage(null);
    try {
      const storedLocations = JSON.parse(
        localStorage.getItem('selectedLocations') || '[]'
      );
      let response;
      const validLocations = storedLocations;
      const locationIds = validLocations.map((location) => location.id);

      switch (strongestRole) {
        case 'Teacher':
        case 'Student':
          console.log('Fetching teacher/student sessions');
          response = await fetchUserClassSessions(
            userId?.toString() || '',
            date,
            date
          );
          if (
            JSON.stringify(response.userLocations) !==
            JSON.stringify(selectedLocations)
          ) {
            setSelectedLocations(response.userLocations);
          }
          const teacherEvents = transformClassSessionsToEvents(
            response.sessionInstances
          );
          setClassSessionEvents(teacherEvents);
          break;
        case 'Parent':
          response = await fetchParentClassSessions(
            userId?.toString() || '',
            date,
            date
          );
          const parentEvents = transformClassSessionsToEvents(
            response.sessionInstances
          );
          setParentNbOfRooms(response.numberOfRooms);
          setClassSessionEvents(parentEvents);
          break;
        case 'SuperAdmin':
        case 'FranchiseAdmin':
        case 'LocationAdmin':
          if (validLocations.length === 0) {
            return;
          }
          response = await fetchClassSessions(date, date, locationIds);
          const adminEvents = transformClassSessionsToEvents(
            response.sessionInstances
          );
          setClassSessionEvents(adminEvents);
          break;
        default:
          console.error('Invalid role: Unrecognized role encountered.');
          throw new Error('Invalid role');
      }
    } catch (error) {
      console.error('Failed to load class sessions', error);
      setErrorMessage('Failed to load class sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialDays = async (locations: any[], year?: number) => {
    try {
      if (locations.length === 0) {
        localStorage.removeItem(HOLIDAYS_STORAGE_KEY);
        localStorage.removeItem(CLOSING_DAYS_STORAGE_KEY);
        setHolidays([]);
        setClosingDays([]);
        return;
      }

      const locationIds = locations.map((loc) => loc.id);
      const targetYear = year || new Date().getFullYear();

      // Function to check if stored data is valid and for the correct year
      const isValidStoredData = (
        storedData: string | null,
        locationIds: number[],
        year: number
      ) => {
        if (!storedData) return false;
        try {
          const parsed = JSON.parse(storedData);
          const storedLocationIds = [
            ...new Set(parsed.map((day: Holiday) => day.locationId))
          ];
          const requestedLocationIds = [...new Set(locationIds)];
          const hasCorrectLocations =
            JSON.stringify(storedLocationIds.sort()) ===
            JSON.stringify(requestedLocationIds.sort());

          // Check if data contains dates from the target year
          const hasYearData = parsed.some((day: Holiday) => {
            const startYear = new Date(day.start_date).getFullYear();
            const endYear = new Date(day.end_date).getFullYear();
            return startYear === year || endYear === year;
          });

          return hasCorrectLocations && hasYearData;
        } catch {
          return false;
        }
      };

      const storedHolidays = localStorage.getItem(HOLIDAYS_STORAGE_KEY);
      const storedClosingDays = localStorage.getItem(CLOSING_DAYS_STORAGE_KEY);

      if (
        !isValidStoredData(storedHolidays, locationIds, targetYear) ||
        !isValidStoredData(storedClosingDays, locationIds, targetYear)
      ) {
        const [holidaysResponse, closingDaysResponse] = await Promise.all([
          fetchHolidaysByLocationIds(locationIds, targetYear),
          fetchClosingDaysByLocationIds(locationIds, targetYear)
        ]);

        localStorage.setItem(
          HOLIDAYS_STORAGE_KEY,
          JSON.stringify(holidaysResponse.data)
        );
        localStorage.setItem(
          CLOSING_DAYS_STORAGE_KEY,
          JSON.stringify(closingDaysResponse.data)
        );

        setHolidays(holidaysResponse.data);
        setClosingDays(closingDaysResponse.data);
      } else {
        setHolidays(JSON.parse(storedHolidays!));
        setClosingDays(JSON.parse(storedClosingDays!));
      }
    } catch (error) {
      console.error('Error fetching special days:', error);
      localStorage.removeItem(HOLIDAYS_STORAGE_KEY);
      localStorage.removeItem(CLOSING_DAYS_STORAGE_KEY);
    }
  };

  useEffect(() => {
    const onAbsenceUpdated = () => {
      loadClassSessions();
    };

    calendarsharedService.on('absenceUpdated', onAbsenceUpdated);

    return () => {
      calendarsharedService.off('absenceUpdated', onAbsenceUpdated);
    };
  }, []);

  useEffect(() => {
    if (
      strongestRole &&
      (strongestRole !== 'SuperAdmin' || selectedLocations.length > 0)
    ) {
      loadClassSessions();
    }
  }, [date, selectedFranchise, selectedLocations, strongestRole]);

  useEffect(() => {
    if (
      strongestRole &&
      (strongestRole !== 'SuperAdmin' || selectedLocations.length > 0)
    ) {
      fetchSpecialDays(selectedLocations);
    }
  }, [selectedFranchise, selectedLocations, strongestRole]);

  useEffect(() => {
    if (
      strongestRole &&
      (strongestRole !== 'SuperAdmin' || selectedLocations.length > 0)
    ) {
      const VIEW_STORAGE_KEY = 'calendarViewPreference';
      const initialView =
        localStorage.getItem(VIEW_STORAGE_KEY) || 'resourceTimelineDay';

      if (initialView === 'listWeek') {
        const weekStart = moment(date).startOf('isoWeek');
        const weekEnd = moment(date).endOf('isoWeek');
        handleDateRangeChange(
          weekStart.format('YYYY-MM-DD'),
          weekEnd.format('YYYY-MM-DD')
        );
      } else {
        loadClassSessions();
      }
    }
  }, [date, strongestRole, selectedLocations]);

  const handleDateRangeChange = async (startDate: string, endDate: string) => {
    setLoading(true);
    setErrorMessage(null);

    checkAndUpdateYear(startDate);
    checkAndUpdateYear(endDate);

    try {
      const locationIds = selectedLocations.map((location) => location.id);
      let response;

      switch (strongestRole) {
        case 'Teacher':
        case 'Student':
          response = await fetchUserClassSessions(
            userId?.toString() || '',
            startDate,
            endDate
          );
          setClassSessionEvents(
            transformClassSessionsToEvents(response.sessionInstances)
          );
          break;
        case 'Parent':
          response = await fetchParentClassSessions(
            userId?.toString() || '',
            startDate,
            endDate
          );
          setClassSessionEvents(
            transformClassSessionsToEvents(response.sessionInstances)
          );
          break;
        case 'SuperAdmin':
        case 'FranchiseAdmin':
        case 'LocationAdmin':
          if (locationIds.length === 0) return;
          response = await fetchClassSessions(startDate, endDate, locationIds);
          setClassSessionEvents(
            transformClassSessionsToEvents(response.sessionInstances)
          );
          break;
      }
    } catch (error) {
      console.error('Failed to load class sessions', error);
      setErrorMessage('Failed to load class sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    console.log('Date changed:', date, '->', newDate);
    setDate(newDate);
    checkAndUpdateYear(newDate);
  };

  const checkAndUpdateYear = (dateStr: string) => {
    const newYear = moment(dateStr).year();
    if (newYear !== currentViewYear) {
      console.log('Year changed:', currentViewYear, '->', newYear);
      setCurrentViewYear(newYear);
      fetchSpecialDays(selectedLocations, newYear);
    }
  };

  const handleFranchiseChange = (franchise: any) => {
    setSelectedFranchise(franchise);
    setSelectedLocations([]);
    setClassSessionEvents([]);
    if (franchise) {
      localStorage.setItem('selectedFranchise', JSON.stringify(franchise));
    } else {
      localStorage.removeItem('selectedFranchise');
      localStorage.removeItem('selectedLocations');
    }
  };

  const handleLocationsChange = (locations: any[]) => {
    setSelectedLocations(locations);
    setClassSessionEvents([]);
    if (locations.length > 0) {
      localStorage.setItem('selectedLocations', JSON.stringify(locations));
      fetchSpecialDays(locations);
    } else {
      localStorage.removeItem('selectedLocations');
      setHolidays([]);
      setClosingDays([]);
    }
  };

  return (
    <Box>
      <Box>
        {['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin'].includes(
          strongestRole || ''
        ) && (
          <FilterToolbar
            onFranchiseChange={handleFranchiseChange}
            onLocationsChange={handleLocationsChange}
            selectedFranchise={selectedFranchise}
            selectedLocations={selectedLocations}
          />
        )}
        {selectedLocations.length === 0 &&
          strongestRole !== 'Teacher' &&
          strongestRole !== 'Student' &&
          strongestRole !== 'Parent' && (
            <Typography variant="h6" color="white" sx={{ ml: 2 }}>
              Please enter a franchise and select locations to view the
              calendar.
            </Typography>
          )}
        <CustomizedCalendar
          classSessionEvents={classSessionEvents}
          onDateChange={handleDateChange} // Use the new handler instead of setDate directly
          loadClassSessions={loadClassSessions}
          selectedLocations={selectedLocations}
          holidays={holidays}
          closingDays={closingDays}
          parentNumberOfRooms={parentNbOfRooms}
          onDateRangeChange={handleDateRangeChange}
        />
      </Box>
    </Box>
  );
};

export default CalendarContent;

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
  Holiday,
  fetchClassSessions,
  fetchClosingDaysByLocationIds,
  fetchHolidaysByLocationIds,
  fetchParentClassSessions,
  fetchUserClassSessions
} from 'src/services/classSessionService';
import { calendarsharedService } from './CalendarSharedService';
import { useHeaderMenu } from './Components/CustomizedCalendar/HeaderMenuContext';
import { fetchLocationsByFranchise } from 'src/services/locationService';

const CalendarContent: React.FC = () => {
  const [classSessionEvents, setClassSessionEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [closingDays, setClosingDays] = useState<Holiday[]>([]);
  const [startDate, setStartDate] = useState<string>(
    moment().startOf('month').format('YYYY-MM-DD')
  );
  const [endDate, setEndDate] = useState<string>(
    moment().endOf('month').format('YYYY-MM-DD')
  );
  const [date, setDate] = useState<string>(() => moment().format('YYYY-MM-DD'));
  const [strongestRole, setStrongestRole] = useState<string | null>(null);
  const [parentNbOfRooms, setParentNbOfRooms] = useState<number>(0);
  const { userId, userRoles } = useAuth();
  const {
    selectedFranchise,
    setSelectedFranchise,
    selectedLocations,
    setSelectedLocations
  } = useHeaderMenu();

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

  useEffect(() => {
    if (selectedFranchise) {
      fetchLocationsByFranchise(selectedFranchise.id)
        .then((locations) => {
          setSelectedLocations(locations);
        })
        .catch((error) => {
          console.error('Error fetching locations:', error);
          setErrorMessage('Failed to fetch locations');
        });
    } else {
      setSelectedLocations([]);
    }
  }, [selectedFranchise, setSelectedLocations]);

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
            isHolidayCourse: session.isHolidayCourse,
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
    setLoading(true);
    setErrorMessage(null);

    try {
      let response;
      const validLocations = Array.isArray(locations) ? locations : [];
      const locationIds = validLocations.map((location) => location.id);

      switch (strongestRole) {
        case 'Teacher':
        case 'Student':
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

  const fetchSpecialDays = async (locations: any[]) => {
    try {
      if (locations.length === 0) return;

      const locationIds = locations.map((loc) => loc.id);

      const [holidaysResponse, closingDaysResponse] = await Promise.all([
        fetchHolidaysByLocationIds(locationIds),
        fetchClosingDaysByLocationIds(locationIds)
      ]);

      setHolidays(holidaysResponse.data);
      setClosingDays(closingDaysResponse.data);
    } catch (error) {
      console.error('Error fetching special days:', error);
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

  useEffect(() => {
    if (
      strongestRole &&
      (strongestRole !== 'SuperAdmin' || selectedLocations.length > 0)
    ) {
      fetchSpecialDays(selectedLocations);
      loadClassSessions();
    }
  }, [date, selectedFranchise, selectedLocations, strongestRole]);

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CustomizedCalendar
          classSessionEvents={classSessionEvents}
          onDateChange={setDate}
          loadClassSessions={loadClassSessions}
          selectedLocations={selectedLocations}
          holidays={holidays}
          closingDays={closingDays}
          parentNumberOfRooms={parentNbOfRooms}
        />
        {selectedLocations.length === 0 &&
          strongestRole !== 'Teacher' &&
          strongestRole !== 'Student' &&
          strongestRole !== 'Parent' && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}
            >
              <Typography variant="h6" color="white">
                Please enter a franchise and select locations to view the
                calendar.
              </Typography>
            </Box>
          )}
      </Box>
    </Box>
  );
};

export default CalendarContent;

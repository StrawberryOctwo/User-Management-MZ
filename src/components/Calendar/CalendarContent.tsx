import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CustomizedCalendar from './Components/CustomizedCalendar/CustomizedCalendar';
import moment from 'moment';
import { EventItem } from './types';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { t, use } from 'i18next';
import FilterToolbar from './Components/CustomizedCalendar/FilterToolbar';
import CalendarLegend from './Components/CalendarLegend';
import { useAuth } from 'src/hooks/useAuth';
import { getStrongestRoles } from 'src/hooks/roleUtils';
import {
  fetchClassSessions,
  fetchParentClassSessions,
  fetchUserClassSessions
} from 'src/services/classSessionService';
import { calendarsharedService } from './CalendarSharedService';

const CalendarContent: React.FC = () => {
  const [classSessionEvents, setClassSessionEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(
    moment().startOf('month').format('YYYY-MM-DD')
  );
  const [endDate, setEndDate] = useState<string>(
    moment().endOf('month').format('YYYY-MM-DD')
  );
  const [date, setDate] = useState<string>(() => moment().format('YYYY-MM-DD'));
  const [selectedFranchise, setSelectedFranchise] = useState<any | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<any[]>([]); // Updated to array
  const [strongestRole, setStrongestRole] = useState<string | null>(null);

  const { userId, userRoles } = useAuth();
  // const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];

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
      setSelectedLocations(JSON.parse(savedLocations));
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
    };

    calendarsharedService.on('absenceUpdated', onAbsenceUpdated);

    return () => {
      calendarsharedService.off('absenceUpdated', onAbsenceUpdated);
    };
  }, []);

  const transformClassSessionsToEvents = (
    classSessions: any[]
  ): EventItem[] => {
    return classSessions.map((session) => {
      const resource = session.name || 1;

      console.log('students', session);
      const studentsWithStatus = session.students.map((student) => ({
        firstName: student.firstName,
        gradeLevel: student.gradeLevel,
        absenceStatus: student.absences.length > 0 ? true : false,
      }));

      return {
        data: {
          appointment: {
            id: session.id,
            status: session.status,
            location: session.location?.name || 'Unknown Location',
            topic: session.topic?.name || 'Unknown Topic',
            resource: session.name || 'Unknown Teacher',
            address: session.location || 'Unknown address',
            className: session.name,
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
      const locationIds = locations.map((location) => location.id);
      switch (strongestRole) {
        case 'Teacher':
        case 'Student':
          response = await fetchUserClassSessions(
            userId?.toString() || '',
            date,
            date
          );
          if (JSON.stringify(response.userLocations) !== JSON.stringify(selectedLocations)) {
            setSelectedLocations(response.userLocations);
          } break;
        case 'Parent':
          response = await fetchParentClassSessions(
            userId?.toString() || '',
            date,
            date
          );
          break;
        case 'SuperAdmin':
        case 'FranchiseAdmin':
        case 'LocationAdmin':
          if (locations.length === 0) {
            return;
          }
          response = await fetchClassSessions(date, date, locationIds);
          break;
        default:
          console.error('Invalid role: Unrecognized role encountered.');
          throw new Error('Invalid role');
      }

      const events = transformClassSessionsToEvents(response.sessionInstances);
      setClassSessionEvents(events);
    } catch (error) {
      console.error('Failed to load class sessions', error);
      setErrorMessage('Failed to load class sessions. Please try again.');
    } finally {
      setLoading(false);
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
    // Updated to multiple locations
    setSelectedLocations(locations);
    setClassSessionEvents([]);
    if (locations.length > 0) {
      localStorage.setItem('selectedLocations', JSON.stringify(locations));
    } else {
      localStorage.removeItem('selectedLocations');
    }
  };

  useEffect(() => {
    if (
      strongestRole &&
      (strongestRole !== 'SuperAdmin' || selectedLocations.length > 0)
    ) {
      loadClassSessions();
    }
  }, [date, selectedFranchise, selectedLocations, strongestRole]);

  return (
    <Box sx={{ position: 'relative', height: '74vh' }}>
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

      <Box sx={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
        <CustomizedCalendar
          classSessionEvents={classSessionEvents}
          onDateChange={setDate}
          loadClassSessions={loadClassSessions}
          selectedLocations={selectedLocations}
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
                height: '100%',
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

      <CalendarLegend />
    </Box>
  );
};

export default CalendarContent;

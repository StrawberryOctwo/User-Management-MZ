import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CustomizedCalendar from "./Components/CustomizedCalendar/CustomizedCalendar";
import moment from "moment";
import { EventItem } from './types';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { t } from 'i18next';
import FilterToolbar from './Components/CustomizedCalendar/FilterToolbar';
import CalendarLegend from './Components/CalendarLegend';
import { useAuth } from 'src/hooks/useAuth';
import { getStrongestRoles } from 'src/hooks/roleUtils';
import { addClassSessions, fetchClassSessions, fetchParentClassSessions, fetchUserClassSessions } from 'src/services/classSessionService';
import { calendarsharedService } from './CalendarSharedService';

const CalendarContent: React.FC = () => {
  const [classSessionEvents, setClassSessionEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(moment().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState<string>(moment().endOf('month').format('YYYY-MM-DD'));
  const [selectedFranchise, setSelectedFranchise] = useState<any | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<any[]>([]); // Updated to array

  const { userId, userRoles } = useAuth();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];
  const strongestRole = strongestRoles.includes('SuperAdmin')
    ? 'SuperAdmin'
    : strongestRoles.includes('FranchiseAdmin')
      ? 'FranchiseAdmin'
      : strongestRoles.includes('LocationAdmin')
        ? 'LocationAdmin'
        : strongestRoles.includes('Teacher')
          ? 'Teacher'
          : strongestRoles.includes('Parent')
            ? 'Parent'
            : strongestRoles.includes('Student')
              ? 'Student'
              : null;

  useEffect(() => {
    const savedFranchise = localStorage.getItem('selectedFranchise');
    const savedLocations = localStorage.getItem('selectedLocations'); // Updated to locations

    if (savedFranchise) {
      setSelectedFranchise(JSON.parse(savedFranchise));
    }
    if (savedLocations) {
      setSelectedLocations(JSON.parse(savedLocations));
    }
  }, []);

  const transformClassSessionsToEvents = (classSessions: any[]): EventItem[] => {
    return classSessions.map((session) => {
      const resource = session.teacher?.id || 1;
      const teacherName = session.teacher?.user
        ? `${session.teacher.user.firstName} ${session.teacher.user.lastName}`
        : "Unknown Teacher";

      // Map students to an array of first names
      const studentFirstNames = session.students.map((student) => student.firstName);
      const studentsWithStatus = session.students.map((student) => ({
        firstName: student.firstName,
        absenceStatus: student.absenceStatus, // Assuming absenceStatus is directly available on each student
      }));

      return {
        start: moment(session.sessionStartDate).toDate(),
        end: moment(session.sessionEndDate).toDate(),
        data: {
          appointment: {
            id: session.id,
            status: session.isActive ? "CI" : "P",
            location: session.location?.name || "Unknown Location",
            topic: session.topic?.name || "Unknown Topic",
            resource: session.teacher?.idNumber || "Unknown Teacher",
            address: session.location || "Unknown address",
            className: session.name,
            teacher: teacherName,
            studentCount: session.students.length,
            students: studentsWithStatus, // Array of first names of students
            startTime: moment(session.sessionStartDate).format('HH:mm'),
            endTime: moment(session.sessionEndDate).format('HH:mm'),
            sessionType: session.sessionType,
          }
        },
        resourceId: resource,
      };
    });
  };


  const loadClassSessions = async () => {
    console.log("loadClassSessions called");

    setLoading(true);
    setErrorMessage(null);

    try {
      let response;
      const locationIds = selectedLocations.map(location => location.id); // Pass as array

      switch (strongestRole) {
        case 'Teacher':
        case 'Student':
          response = await fetchUserClassSessions(userId?.toString() || '', startDate, endDate);
          break;
        case 'Parent':
          response = await fetchParentClassSessions(userId?.toString() || '', startDate, endDate);
          break;
        case 'SuperAdmin':

        case 'FranchiseAdmin':
        case 'LocationAdmin':
          if (selectedLocations.length === 0) return;
          response = await fetchClassSessions(startDate, endDate, locationIds);
          break;
        default:
          throw new Error('Invalid role');
      }

      const events = transformClassSessionsToEvents(response.data);

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
      console.log("Event 'absenceUpdated' received"); // Log when event is received
      loadClassSessions();
    };

    calendarsharedService.on('absenceUpdated', onAbsenceUpdated);

    return () => {
      calendarsharedService.off('absenceUpdated', onAbsenceUpdated);
    };
  }, []);

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleSaveClassSession = async (newSessionArray: any[], callback?: () => void) => {
    try {
      for (const session of newSessionArray) {
        const sessionPayload = {
          ...session,
          locationId: session.locationId || selectedLocations[0]?.id || 0,
        };
        await addClassSessions(sessionPayload);
      }
      loadClassSessions();
    } catch (error) {
      console.error('Failed to add class sessions:', error);
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

  const handleLocationsChange = (locations: any[]) => { // Updated to multiple locations
    setSelectedLocations(locations);
    setClassSessionEvents([]);
    if (locations.length > 0) {
      localStorage.setItem('selectedLocations', JSON.stringify(locations));
    } else {
      localStorage.removeItem('selectedLocations');
    }
  };

  useEffect(() => {
    if (strongestRole && (strongestRole !== 'SuperAdmin' || selectedLocations.length > 0)) {
      loadClassSessions();
    }
  }, [startDate, endDate, selectedFranchise, selectedLocations]);

  return (
    <Box sx={{ position: 'relative', height: '74vh' }}>
      {['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin'].includes(strongestRole || '') && (
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
          onDateChange={handleDateChange}
          handleSaveClassSession={handleSaveClassSession}
          loadClassSessions={loadClassSessions}
        />
        {selectedLocations.length === 0 && strongestRole !== 'Teacher' && strongestRole !== 'Student' && strongestRole !== 'Parent' && (
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
              zIndex: 1000,
            }}
          >
            <Typography variant="h6" color="white">
              Please enter a franchise and select locations to view the calendar.
            </Typography>
          </Box>
        )}
      </Box>

      <CalendarLegend />
    </Box>
  );
};

export default CalendarContent;

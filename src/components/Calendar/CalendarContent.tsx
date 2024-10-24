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
import { addClassSessions, fetchClassSessions, fetchUserClassSessions } from 'src/services/classSessionService';

const CalendarContent: React.FC = () => {
  const [classSessionEvents, setClassSessionEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(moment().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState<string>(moment().endOf('month').format('YYYY-MM-DD'));
  const [selectedFranchise, setSelectedFranchise] = useState<any | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);

  const { userId, userRoles } = useAuth();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];

  // Determine the strongest role to drive the logic
  const strongestRole = strongestRoles.includes('SuperAdmin')
    ? 'SuperAdmin'
    : strongestRoles.includes('FranchiseAdmin')
      ? 'FranchiseAdmin'
      : strongestRoles.includes('LocationAdmin')
        ? 'LocationAdmin'
        : strongestRoles.includes('Teacher')
          ? 'Teacher'
          : strongestRoles.includes('Student')
            ? 'Student'
            : null;

  useEffect(() => {
    const savedFranchise = localStorage.getItem('selectedFranchise');
    const savedLocation = localStorage.getItem('selectedLocation');

    if (savedFranchise) {
      setSelectedFranchise(JSON.parse(savedFranchise));
    }
    if (savedLocation) {
      setSelectedLocation(JSON.parse(savedLocation));
    }
  }, []);

  const transformClassSessionsToEvents = (classSessions: any[]): EventItem[] => {
    return classSessions.map((session) => {
      const resource = session.teacher?.id || 1;
      const teacherName = session.teacher?.user
        ? `${session.teacher.user.firstName} ${session.teacher.user.lastName}`
        : "Unknown Teacher";

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
    setLoading(true);
    setErrorMessage(null);

    try {
      let response;
      switch (strongestRole) {
        case 'Teacher':
        case 'Student':
          response = await fetchUserClassSessions(userId?.toString() || '', startDate, endDate);
          break;
        case 'SuperAdmin':
        case 'FranchiseAdmin':
        case 'LocationAdmin':
          if (!selectedLocation) return; // Ensure location is selected
          response = await fetchClassSessions(startDate, endDate, selectedLocation.name);
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

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleSaveClassSession = async (newSessionArray: any[], callback?: () => void) => {
    try {
      for (const session of newSessionArray) {
        // Ensure locationId is directly from the session object
        const sessionPayload = {
          ...session,
          locationId: session.locationId || selectedLocation?.id || 0, // Use session location or fallback to selectedLocation
        };

        console.log('Original Session:', session);
        console.log('Session Payload:', sessionPayload);
        await addClassSessions(sessionPayload);
      }

      loadClassSessions(); // Reload sessions after adding
    } catch (error) {
      console.error('Failed to add class sessions:', error);
    }
  };


  const handleFranchiseChange = (franchise: any) => {
    setSelectedFranchise(franchise);
    setSelectedLocation(null);
    setClassSessionEvents([]);

    if (franchise) {
      localStorage.setItem('selectedFranchise', JSON.stringify(franchise));
    } else {
      localStorage.removeItem('selectedFranchise');
      localStorage.removeItem('selectedLocation');
    }
  };

  const handleLocationChange = (location: any) => {
    setSelectedLocation(location);
    setClassSessionEvents([]);

    if (location) {
      localStorage.setItem('selectedLocation', JSON.stringify(location));
    } else {
      localStorage.removeItem('selectedLocation');
    }
  };

  useEffect(() => {
    if (strongestRole && (strongestRole !== 'SuperAdmin' || selectedLocation)) {
      loadClassSessions(); // Load sessions if role is valid and location is selected (for admins)
    }
  }, [startDate, endDate, selectedFranchise, selectedLocation]);

  return (
    <Box sx={{ position: 'relative', height: '78vh' }}>
      {['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin'].includes(strongestRole || '') && (
        <FilterToolbar
          onFranchiseChange={handleFranchiseChange}
          onLocationChange={handleLocationChange}
          selectedFranchise={selectedFranchise}
          selectedLocation={selectedLocation}
        />
      )}


      <Box sx={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
        <CustomizedCalendar
          classSessionEvents={classSessionEvents}
          onDateChange={handleDateChange}
          handleSaveClassSession={handleSaveClassSession}
          loadClassSessions={loadClassSessions}
        />
        {!selectedLocation && strongestRole !== 'Teacher' && strongestRole !== 'Student' && (
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
              Please enter a franchise and location to view the calendar.
            </Typography>
          </Box>
        )}
      </Box>

      <CalendarLegend />
    </Box>
  );
};

export default CalendarContent;

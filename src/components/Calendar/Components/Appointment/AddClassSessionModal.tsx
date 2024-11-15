import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useAuth } from 'src/hooks/useAuth';
import { getStrongestRoles } from 'src/hooks/roleUtils';
import { fetchSessionTypes } from 'src/services/contractPackagesService';
import AddClassSessionDialog from './AddClassSessionForm';
import { fetchLocations } from 'src/services/locationService';
import { fetchStudents } from 'src/services/studentService';
import {
  fetchTeacherByUserId,
  fetchTeachers
} from 'src/services/teacherService';
import { fetchTopics } from 'src/services/topicService';

interface AddClassSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newSession: any) => void;
  roomId?: string | number;
  passedLocations?: any[];
  startTime?: Date;
}

export default function AddClassSessionModal({
  isOpen,
  onClose,
  onSave,
  roomId,
  passedLocations = [],
  startTime
}: AddClassSessionModalProps) {
  // Auth states
  const { userId, userRoles } = useAuth();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];

  // Session states
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(
    passedLocations[0] || null
  );
  const [sessionTypes, setSessionTypes] = useState<any[]>([]);
  const [newSession, setNewSession] = useState<any>({
    name: roomId || '',
    startDate: startTime || new Date(),
    endDate: new Date(),
    note: '',
    sessionType: '',
    isHolidayCourse: false,
    teacherId: 0,
    topicId: 0,
    locationId: passedLocations[0]?.id || 0,
    studentIds: []
  });

  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: string | null;
  }>({});

  // Recurrence-related states
  const [recurrencePatternOption, setRecurrencePatternOption] =
    useState<string>('weekly');
  const [dayDetails, setDayDetails] = useState<{
    [key: string]: { startTime: string; duration: number };
  }>({});

  const handleDayDetailChange = (day: string, field: string, value: any) => {
    setDayDetails((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const resetDayDetails = () => {
    setDayDetails({});
  };

  const handleDayToggle = (
    event: React.MouseEvent<HTMLElement>,
    newDays: string | string[] | null
  ) => {
    // Ensure newDays is always an array
    const selectedDays = Array.isArray(newDays)
      ? newDays
      : newDays
      ? [newDays]
      : [];

    setDayDetails((prev) => {
      const updatedDetails = { ...prev };

      // Add new days to dayDetails
      selectedDays.forEach((day) => {
        if (!updatedDetails[day]) {
          updatedDetails[day] = { startTime: '', duration: 0 };
        }
      });

      // Remove days that are no longer selected
      Object.keys(updatedDetails).forEach((day) => {
        if (!selectedDays.includes(day)) {
          delete updatedDetails[day];
        }
      });

      return updatedDetails;
    });
  };

  const handleSave = () => {
    newSession.recurrencePattern = recurrencePatternOption;
    newSession.sessions = Object.keys(dayDetails).map((day) => ({
      day,
      startTime: dayDetails[day].startTime,
      duration: dayDetails[day].duration
    }));
    console.log('Saving session:', newSession);
    onSave(newSession);
    clearForm();
  };

  const clearForm = () => {
    setSelectedStudents([]);
    setSelectedTeacher(null);
    setSelectedTopic(null);
    setSelectedLocation(passedLocations[0] || null);
    setNewSession({
      name: roomId || '',
      startDate: startTime || new Date(),
      endDate: new Date(),
      note: '',
      sessionType: '',
      isHolidayCourse: false,
      teacherId: 0,
      topicId: 0,
      locationId: passedLocations[0]?.id || 0,
      studentIds: []
    });
    setFieldErrors({});
    setRecurrencePatternOption('none');
    setDayDetails({});
  };

  useEffect(() => {
    const fetchData = async () => {
      const types = await fetchSessionTypes();
      setSessionTypes(types);
    };
    fetchData();

    if (roomId) {
      setNewSession((prev) => ({ ...prev, name: roomId as string }));
    }
  }, [roomId]);

  const handleClose = () => {
    clearForm();
    onClose();
  };

  return (
    <AddClassSessionDialog
      isOpen={isOpen}
      handleClose={handleClose}
      handleSave={handleSave}
      newSession={newSession}
      setNewSession={setNewSession}
      selectedTeacher={selectedTeacher}
      setSelectedTeacher={setSelectedTeacher}
      selectedStudents={selectedStudents}
      setSelectedStudents={setSelectedStudents}
      selectedLocation={selectedLocation}
      setSelectedLocation={setSelectedLocation}
      selectedTopic={selectedTopic}
      setSelectedTopic={setSelectedTopic}
      strongestRoles={strongestRoles}
      userId={userId}
      fetchTeacherByUserId={fetchTeacherByUserId}
      fetchTeachers={fetchTeachers}
      fetchStudents={fetchStudents}
      fetchLocations={fetchLocations}
      fetchTopics={fetchTopics}
      fieldErrors={fieldErrors}
      sessionTypes={sessionTypes}
      recurrencePatternOption={recurrencePatternOption}
      setRecurrencePatternOption={setRecurrencePatternOption}
      resetDayDetails={resetDayDetails}
      dayDetails={dayDetails}
      handleDayDetailChange={handleDayDetailChange}
      handleDayToggle={handleDayToggle}
    />
  );
}

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Box,
  FormControlLabel,
  Typography,
  Checkbox,
} from '@mui/material';
import moment from 'moment';


import { t } from 'i18next';
import { fetchStudents } from 'src/services/studentService';
import { fetchTopics } from 'src/services/topicService';
import { fetchTeachers } from 'src/services/teacherService';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';

interface ClassSession {
  name: string;
  sessionStartDate: Date;
  sessionEndDate: Date;
  sessionType: string;
  isActive: boolean;
  isHolidayCourse: boolean;
  teacherId: any;
  topicId: any;
  locationId: any;
  studentIds: number[];
}

export default function AddClassSessionModal({
  isOpen,
  onClose,
  onSave,
  initialStartDate,
  initialEndDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newSession: any) => void;
  initialStartDate: Date;
  initialEndDate: Date;
}) {
  const [newSession, setNewSession] = useState<ClassSession>({
    name: '',
    sessionStartDate: initialStartDate,
    sessionEndDate: initialEndDate,
    sessionType: 'Online',
    isActive: false,
    isHolidayCourse: false,
    teacherId: 0,
    topicId: 0,
    locationId: 0,
    studentIds: [],
  });

  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [maxStudents, setMaxStudents] = useState(4);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string | null }>({});
  const [studentError, setStudentError] = useState<string | null>(null);
  const [startTimeError, setStartTimeError] = useState<string | null>(null);
  const [endTimeError, setEndTimeError] = useState<string | null>(null);

  const [isRepeat, setIsRepeat] = useState(false);
  const [repeatUntilDate, setRepeatUntilDate] = useState<Date | null>(null);
  const [repeatUntilWeek, setRepeatUntilWeek] = useState<string | null>(null);


  const validateTime = (date: Date | null, type: 'start' | 'end'): boolean => {
    if (date) {
      const hour = date.getHours();
      if (hour < 9 || hour > 20) {
        if (type === 'start') {
          setStartTimeError(t('errors.invalidStartTime'));
        } else {
          setEndTimeError(t('errors.invalidEndTime'));
        }
        return false;
      } else {
        setStartTimeError(null);
        setEndTimeError(null);
        return true;
      }
    }
    return false;
  };

  const handleSave = () => {
    const errors: { [key: string]: string | null } = {};
    const sessionArray: ClassSession[] = [];

    // Validate required fields
    if (!newSession.name.trim()) errors.name = t('errors.classNameRequired');
    if (!newSession.sessionStartDate) errors.sessionStartDate = t('errors.startTimeRequired');
    if (!newSession.sessionEndDate) errors.sessionEndDate = t('errors.endTimeRequired');
    if (!selectedTeacher) errors.teacherId = t('errors.teacherSelectionRequired');
    if (!selectedTopic) errors.topicId = t('errors.topicSelectionRequired');

    const { validatedStudents, error } = validateStudentSelection(
      newSession.sessionType,
      selectedStudents,
      maxStudents
    );

    if (error) {
      setStudentError(error);
      errors.studentIds = error;
    } else {
      setStudentError(null);
    }

    setFieldErrors(errors);

    const isStartTimeValid = validateTime(new Date(newSession.sessionStartDate), 'start');
    const isEndTimeValid = validateTime(new Date(newSession.sessionEndDate), 'end');

    // Check for any errors or invalid times
    if (
      Object.values(errors).some((error) => error !== null) ||
      !isStartTimeValid ||
      !isEndTimeValid
    ) {
      return; // Exit if any validation fails
    }

    // Handle repeated sessions if applicable
    if (isRepeat && repeatUntilWeek) {
      const untilDate = parseWeekToDate(repeatUntilWeek);

      let currentStartDate = new Date(newSession.sessionStartDate);
      let currentEndDate = new Date(newSession.sessionEndDate);

      console.log('Repeating sessions:');
      // Loop to generate sessions until the repeat week
      while (moment(currentStartDate).isSameOrBefore(untilDate, 'week')) {
        console.log(`Start: ${moment(currentStartDate).format('YYYY-MM-DD HH:mm')}`);
        console.log(`End: ${moment(currentEndDate).format('YYYY-MM-DD HH:mm')}`);

        sessionArray.push({
          ...newSession,
          sessionStartDate: new Date(currentStartDate),
          sessionEndDate: new Date(currentEndDate),
          studentIds: validatedStudents.map((student) => student.id),
        });

        currentStartDate.setDate(currentStartDate.getDate() + 7);
        currentEndDate.setDate(currentEndDate.getDate() + 7);
      }
    } else {
      sessionArray.push({
        ...newSession,
        studentIds: validatedStudents.map((student) => student.id),
      });
    }

    console.log('Final Sessions Array:', sessionArray);

    onSave(sessionArray);

    clearForm();
    onClose();
  };

  const parseWeekToDate = (weekString: string): Date => {
    const [year, week] = weekString.split('-W').map(Number);
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (week - 1) * 7;

    // Adjust to the correct day of the week (Monday)
    const dayOffset = firstDayOfYear.getDay() <= 4
      ? 1 - firstDayOfYear.getDay()
      : 8 - firstDayOfYear.getDay();

    return new Date(year, 0, 1 + dayOffset + daysOffset);
  };

  useEffect(() => {
    if (newSession.sessionType === "1on1") {
      setSelectedStudents((prev) => prev.slice(0, 1));
      setMaxStudents(1);
    } else {
      setMaxStudents(4);
    }
  }, [newSession.sessionType]);

  useEffect(() => {
    setNewSession((prevSession) => ({
      ...prevSession,
      sessionStartDate: initialStartDate,
      sessionEndDate: initialEndDate,
    }));
  }, [initialStartDate, initialEndDate]);

  const clearForm = () => {
    setSelectedStudents([]);
    setSelectedTeacher(null);
    setSelectedTopic(null);
    setNewSession({
      name: '',
      sessionStartDate: initialStartDate,
      sessionEndDate: initialEndDate,
      sessionType: 'Online',
      isActive: false,
      isHolidayCourse: false,
      teacherId: 0,
      topicId: 0,
      locationId: 0,
      studentIds: [],
    });
    setFieldErrors({});
  };

  const validateStudentSelection = (sessionType: string, students: any[], maxGroupSize: number = 4) => {
    if (sessionType === "1on1" && students.length !== 1) {
      return {
        validatedStudents: students.slice(0, 1),
        error: 'You must select exactly one student for a 1-on-1 session.',
      };
    } else if (sessionType === 'Group' && students.length > maxGroupSize) {
      return {
        validatedStudents: students.slice(0, maxGroupSize),
        error: `You can select up to ${maxGroupSize} students for a group session.`,
      };
    }
    return { validatedStudents: students, error: null };
  };


  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Class Session</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, mt: 2 }}>
          <TextField
            label="Class Name"
            fullWidth
            value={newSession.name}
            onChange={(e) =>
              setNewSession({ ...newSession, name: e.target.value })
            }
            error={!!fieldErrors.name}
            helperText={fieldErrors.name}
          />
        </Box>


        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Session Type</InputLabel>
            <Select
              label="Session Type"
              value={newSession.sessionType}
              onChange={(e) =>
                setNewSession({ ...newSession, sessionType: e.target.value })
              }
            >
              <MenuItem value="Online">{t('sessionOnline')}</MenuItem>
              <MenuItem value="Group">{t('sessionGroup')}</MenuItem>
              <MenuItem value="1on1">{t('1on1')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Start Time"
            type="datetime-local"
            fullWidth
            value={moment(newSession.sessionStartDate).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => {
              const newStartDate = new Date(e.target.value);
              setNewSession({
                ...newSession,
                sessionStartDate: newStartDate,
              });
              validateTime(newStartDate, 'start'); // Validate start time
            }}
            error={!!fieldErrors.sessionStartDate || !!startTimeError}
            helperText={fieldErrors.sessionStartDate || startTimeError}
          />
          <TextField
            label="End Time"
            type="datetime-local"
            fullWidth
            value={moment(newSession.sessionEndDate).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => {
              const newEndDate = new Date(e.target.value);
              setNewSession({
                ...newSession,
                sessionEndDate: newEndDate,
              });
              validateTime(newEndDate, 'end'); // Validate end time
            }}
            error={!!fieldErrors.sessionEndDate || !!endTimeError}
            helperText={fieldErrors.sessionEndDate || endTimeError}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isRepeat}
                onChange={(e) => setIsRepeat(e.target.checked)}
              />
            }
            label="Repeat Weekly Until"
          />
          {isRepeat && (
            <TextField
              type="week"
              fullWidth
              value={repeatUntilWeek || ''}
              onChange={(e) => setRepeatUntilWeek(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={newSession.isActive}
                  onChange={(e) =>
                    setNewSession({ ...newSession, isActive: e.target.checked })
                  }
                />
              }
              label="Is Active"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={newSession.isHolidayCourse}
                  onChange={(e) =>
                    setNewSession({ ...newSession, isHolidayCourse: e.target.checked })
                  }
                />
              }
              label="Is Holiday Course"
            />
          </Box>
        </Box>


        <Box sx={{ mb: 2 }}>
          <SingleSelectWithAutocomplete
            label="Search Topic"
            fetchData={(query: string) => fetchTopics(1, 5, query).then((response) => response.data)}
            onSelect={(topic) => {
              setSelectedTopic(topic);
              setNewSession({ ...newSession, topicId: topic?.id });
            }}
            displayProperty="name"
            placeholder="Search Topic"
            initialValue={selectedTopic}
            width="100%"
          />
          {fieldErrors.topicId && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {fieldErrors.topicId}
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <SingleSelectWithAutocomplete
            label="Search Teacher"
            fetchData={(query: string | undefined) =>
              fetchTeachers(1, 5, query).then((data) =>
                data.data.map((teacher: any) => ({
                  ...teacher,
                  fullName: `${teacher.firstName} ${teacher.lastName}`
                }))
              )
            }
            onSelect={(teacher) => {
              setSelectedTeacher(teacher);
              setNewSession({ ...newSession, teacherId: teacher?.id });
            }}
            displayProperty="fullName"
            placeholder="Search Teacher"
            initialValue={selectedTeacher}
            width="100%"
          />
          {fieldErrors.teacherId && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {fieldErrors.teacherId}
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <MultiSelectWithCheckboxes
            label="Search Students"
            fetchData={(query: string | undefined) =>
              fetchStudents(1, 5, query).then((data) =>
                data.data.map((student: any) => ({
                  ...student,
                  fullName: `${student.firstName} ${student.lastName}`
                }))
              )
            }
            onSelect={(selectedItems: any) => {
              setSelectedStudents(selectedItems);
              setNewSession({ ...newSession, studentIds: selectedItems.map((item: any) => item.id) });
            }}
            displayProperty="fullName"
            placeholder="Enter student name"
            initialValue={selectedStudents}
            width="100%"
          />
          {studentError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {studentError}
            </Typography>
          )}
        </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

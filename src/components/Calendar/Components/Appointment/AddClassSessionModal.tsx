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
  RadioGroup,
  Radio,
  ListItemText,
  SelectChangeEvent
} from '@mui/material';
import moment from 'moment';
import { t } from 'i18next';
import { fetchStudents } from 'src/services/studentService';
import { fetchTopics } from 'src/services/topicService';
import {
  fetchTeacherByUserId,
  fetchTeachers
} from 'src/services/teacherService';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import { useAuth } from 'src/hooks/useAuth';
import { getStrongestRoles } from 'src/hooks/roleUtils';
import { fetchLocations } from 'src/services/locationService';
import { fetchSessionTypes } from 'src/services/contractPackagesService';

const recurrenceOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' }
];

const daysOfWeek = [
  { value: 'MO', label: 'Monday' },
  { value: 'TU', label: 'Tuesday' },
  { value: 'WE', label: 'Wednesday' },
  { value: 'TH', label: 'Thursday' },
  { value: 'FR', label: 'Friday' },
  { value: 'SA', label: 'Saturday' },
  { value: 'SU', label: 'Sunday' }
];

interface ClassSession {
  name: string;
  startTime: Date;
  note: string;
  duration: number;
  recurrencePattern: string;
  sessionType: string;
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
  roomId,
  passedLocations
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newSession: any) => void;
  startTime: Date;
  roomId?: string | number;
  passedLocations?: any[];
}) {
  const [newSession, setNewSession] = useState<ClassSession>({
    name: '',
    startTime: new Date(),
    note: '',
    duration: 0,
    recurrencePattern: 'weekly',
    sessionType: '',
    isHolidayCourse: false,
    teacherId: 0,
    topicId: 0,
    locationId: passedLocations[0]?.id || 0,
    studentIds: []
  });

  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [maxStudents, setMaxStudents] = useState(4);
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: string | null;
  }>({});
  const [studentError, setStudentError] = useState<string | null>(null);
  const [startTimeError, setStartTimeError] = useState<string | null>(null);
  const [endTimeError, setEndTimeError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null); // Location state
  const [sessionTypes, setSessionTypes] = useState<any[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [recurrencePatternOption, setRecurrencePatternOption] =
    useState<string>('weekly');
  const [biWeeklyTimes, setBiWeeklyTimes] = useState({
    startTime1: new Date(),
    duration1: 0,
    startTime2: new Date(),
    duration2: 0
  });

  const handleDayChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    if (recurrencePatternOption === 'weekly' && value.length > 1) {
      return; // Prevent selecting more than one day for weekly recurrence
    }
    if (recurrencePatternOption === 'biweekly' && value.length > 2) {
      return; // Prevent selecting more than two days for biweekly recurrence
    }
    setSelectedDays(value);
  };

  const generateRRule = (pattern: string, days: string[]): string => {
    if (pattern === 'none') return '';
    const freq = pattern.toUpperCase();
    const byDay = days.map((day) => day.slice(0, 2).toUpperCase()).join(',');
    return `RRULE:FREQ=${freq}${byDay ? `;BYDAY=${byDay}` : ''}`;
  };

  useEffect(() => {
    const rrule = generateRRule(recurrencePatternOption, selectedDays);
    setNewSession((prev) => ({ ...prev, recurrencePattern: rrule }));
  }, [recurrencePatternOption, selectedDays]);

  const { userId, userRoles } = useAuth();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];

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

    // Validate required fields
    if (!newSession.name.trim()) errors.name = t('errors.classNameRequired');
    if (!newSession.startTime) errors.startTime = t('errors.startTimeRequired');

    if (!selectedTeacher)
      errors.teacherId = t('errors.teacherSelectionRequired');
    if (!selectedTopic) errors.topicId = t('errors.topicSelectionRequired');
    if (!selectedLocation)
      errors.locationId = t('errors.locationSelectionRequired');

    const allowedDurations = [45, 60, 90, 120];
    if (!allowedDurations.includes(newSession.duration)) {
      errors.duration = t('errors.invalidDuration', {
        allowed: allowedDurations.join(', ')
      });
    }

    const { validatedStudents, error } = validateStudentSelection(
      newSession.sessionType,
      selectedStudents
    );

    if (error) {
      setStudentError(error);
      errors.studentIds = error;
    } else {
      setStudentError(null);
      setNewSession((prevSession) => ({
        ...prevSession,
        studentIds: validatedStudents.map((student) => student.id)
      }));
    }

    setFieldErrors(errors);

    if (Object.values(errors).some((error) => error !== null)) {
      return;
    }

    const sessionPayload = {
      ...newSession,
      locationId: selectedLocation?.id
    };

    console.log('Session Payload:', sessionPayload);

    // if (isRepeat && repeatUntilDate) {
    //   const generatedSessions = generateRepeatedSessions(
    //     start,
    //     end,
    //     repeatUntilDate
    //   ).map((session) => ({
    //     ...session,
    //     locationId: selectedLocation?.id
    //   }));
    //   onSave(generatedSessions);
    // } else {
    //   onSave([sessionPayload]);
    // }

    onClose();
  };

  useEffect(() => {
    fetchSessionTypes().then((data) => {
      setSessionTypes(data);
    });
  }, []);

  useEffect(() => {
    if (newSession.sessionType === '1on1') {
      setSelectedStudents((prev) => prev.slice(0, 1));
      setMaxStudents(1);
    } else {
      setMaxStudents(4);
    }
  }, [newSession.sessionType]);

  useEffect(() => {
    if (roomId) {
      setNewSession((prev) => ({ ...prev, name: roomId as string }));
    }
  }, [roomId]);

  const clearForm = () => {
    setSelectedStudents([]);
    setSelectedTeacher(null);
    setSelectedTopic(null);
    setSelectedLocation(null);
    setNewSession({
      name: '',
      startTime: new Date(),
      duration: 0,
      recurrencePattern: 'weekly',
      note: '',
      sessionType: '',
      isHolidayCourse: false,
      teacherId: 0,
      topicId: 0,
      locationId: 0,
      studentIds: []
    });
    setFieldErrors({});
  };

  const validateStudentSelection = (sessionType: string, students: any[]) => {
    if (sessionType === '1on1' && students.length !== 1) {
      return {
        validatedStudents: students.slice(0, 1),
        error: 'You must select exactly one student for a 1-on-1 session.'
      };
    }
    return { validatedStudents: students, error: null };
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  // const handleRepeatDateChange = (selectedDate: string) => {
  //   const newRepeatDate = new Date(selectedDate);
  //   const sessionStartDate = newSession.sessionStartDate;

  //   if (newRepeatDate < sessionStartDate) {
  //     setFieldErrors((prev) => ({
  //       ...prev,
  //       repeatDate: t('errors.invalidRepeatDate', {
  //         day: moment(sessionStartDate).format('YYYY-MM-DD')
  //       })
  //     }));
  //   } else {
  //     setFieldErrors((prev) => ({ ...prev, repeatDate: null }));
  //     setRepeatUntilDate(newRepeatDate);
  //   }
  // };

  useEffect(() => {
    if (isOpen && passedLocations && passedLocations[0]) {
      setSelectedLocation(passedLocations[0]);
    }
  }, [isOpen, passedLocations]);

  useEffect(() => {
    if (isOpen && roomId) {
      setNewSession((prevSession) => ({
        ...prevSession,
        name: roomId as string
      }));
    }
  }, [isOpen, roomId]);

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Class Session</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Room</InputLabel>
            <Select
              label="Room"
              value={newSession.name || ''} // Use newSession.name for room selection
              onChange={(e) =>
                setNewSession({ ...newSession, name: e.target.value })
              }
            >
              {Array.from({ length: 7 }, (_, index) => (
                <MenuItem key={index} value={`R${index + 1}`}>
                  {`R${index + 1}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
              {sessionTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <InputLabel>Class Type</InputLabel>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              row
              aria-label="recurrence-pattern"
              name="recurrence-pattern"
              value={recurrencePatternOption}
              onChange={(e) => setRecurrencePatternOption(e.target.value)}
            >
              {recurrenceOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Days of the Week</InputLabel>
            <Select
              label="Days of the Week"
              multiple
              value={selectedDays}
              onChange={handleDayChange}
              renderValue={(selected) => (selected as string[]).join(', ')}
            >
              {daysOfWeek.map((day) => (
                <MenuItem key={day.value} value={day.value}>
                  <Checkbox checked={selectedDays.indexOf(day.value) > -1} />
                  <ListItemText primary={day.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {recurrencePatternOption === 'weekly' && (
          <>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                value={moment(newSession.startTime).format('HH:mm')}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newStartTime = new Date();
                  newStartTime.setHours(parseInt(hours, 10));
                  newStartTime.setMinutes(parseInt(minutes, 10));
                  setNewSession({
                    ...newSession,
                    startTime: newStartTime
                  });
                  validateTime(newStartTime, 'start'); // Validate start time
                }}
                error={!!fieldErrors.sessionStartDate || !!startTimeError}
                helperText={fieldErrors.sessionStartDate || startTimeError}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Duration (minutes)"
                type="number"
                fullWidth
                value={newSession.duration || ''}
                onChange={(e) => {
                  const duration = parseInt(e.target.value, 10);
                  setNewSession({
                    ...newSession,
                    duration
                  });

                  const allowedDurations = [45, 60, 90, 120];
                  if (!allowedDurations.includes(duration)) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      duration: t('errors.invalidDuration', {
                        allowed: allowedDurations.join(', ')
                      })
                    }));
                  } else {
                    setFieldErrors((prev) => ({ ...prev, duration: null }));
                  }
                }}
                error={!!fieldErrors.duration}
                helperText={fieldErrors.duration}
              />
            </Box>
          </>
        )}

        {recurrencePatternOption === 'biweekly' && (
          <>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Start Time 1"
                type="time"
                fullWidth
                value={moment(biWeeklyTimes.startTime1).format('HH:mm')}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newStartTime = new Date();
                  newStartTime.setHours(parseInt(hours, 10));
                  newStartTime.setMinutes(parseInt(minutes, 10));
                  setBiWeeklyTimes((prev) => ({
                    ...prev,
                    startTime1: newStartTime
                  }));
                  validateTime(newStartTime, 'start'); // Validate start time
                }}
                error={!!fieldErrors.sessionStartDate || !!startTimeError}
                helperText={fieldErrors.sessionStartDate || startTimeError}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Duration 1 (minutes)"
                type="number"
                fullWidth
                value={biWeeklyTimes.duration1 || ''}
                onChange={(e) => {
                  const duration = parseInt(e.target.value, 10);
                  setBiWeeklyTimes((prev) => ({
                    ...prev,
                    duration1: duration
                  }));

                  const allowedDurations = [45, 60, 90, 120];
                  if (!allowedDurations.includes(duration)) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      duration: t('errors.invalidDuration', {
                        allowed: allowedDurations.join(', ')
                      })
                    }));
                  } else {
                    setFieldErrors((prev) => ({ ...prev, duration: null }));
                  }
                }}
                error={!!fieldErrors.duration}
                helperText={fieldErrors.duration}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Start Time 2"
                type="time"
                fullWidth
                value={moment(biWeeklyTimes.startTime2).format('HH:mm')}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newStartTime = new Date();
                  newStartTime.setHours(parseInt(hours, 10));
                  newStartTime.setMinutes(parseInt(minutes, 10));
                  setBiWeeklyTimes((prev) => ({
                    ...prev,
                    startTime2: newStartTime
                  }));
                  validateTime(newStartTime, 'start'); // Validate start time
                }}
                error={!!fieldErrors.sessionStartDate || !!startTimeError}
                helperText={fieldErrors.sessionStartDate || startTimeError}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Duration 2 (minutes)"
                type="number"
                fullWidth
                value={biWeeklyTimes.duration2 || ''}
                onChange={(e) => {
                  const duration = parseInt(e.target.value, 10);
                  setBiWeeklyTimes((prev) => ({
                    ...prev,
                    duration2: duration
                  }));

                  const allowedDurations = [45, 60, 90, 120];
                  if (!allowedDurations.includes(duration)) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      duration: t('errors.invalidDuration', {
                        allowed: allowedDurations.join(', ')
                      })
                    }));
                  } else {
                    setFieldErrors((prev) => ({ ...prev, duration: null }));
                  }
                }}
                error={!!fieldErrors.duration}
                helperText={fieldErrors.duration}
              />
            </Box>
          </>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mb: 3,
            ml: 1
          }}
        >
          {/* <FormControlLabel
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
              type="date"
              fullWidth
              value={
                repeatUntilDate
                  ? moment(repeatUntilDate).format('YYYY-MM-DD')
                  : ''
              }
              onChange={(e) => handleRepeatDateChange(e.target.value)}
              error={!!fieldErrors.repeatDate}
              helperText={fieldErrors.repeatDate}
            />
          )} */}

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={newSession.isHolidayCourse}
                  onChange={(e) =>
                    setNewSession({
                      ...newSession,
                      isHolidayCourse: e.target.checked
                    })
                  }
                />
              }
              label="Is Holiday Course"
            />
          </Box>
        </Box>
        <Box sx={{ mb: 2 }}>
          <SingleSelectWithAutocomplete
            label="Select Location"
            fetchData={(query) =>
              fetchLocations(1, 5, query).then((data) => data.data)
            }
            onSelect={(location) => setSelectedLocation(location)}
            displayProperty="name"
            placeholder="Search Location"
            initialValue={selectedLocation}
            width="100%"
            disabled={true}
          />
          {fieldErrors.locationId && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {fieldErrors.locationId}
            </Typography>
          )}
        </Box>
        <Box sx={{ mb: 2 }}>
          <SingleSelectWithAutocomplete
            label="Search Topic"
            fetchData={(query: string) =>
              fetchTopics(1, 5, query).then((response) => response.data)
            }
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
            fetchData={(query: string | undefined) => {
              if (strongestRoles.includes('Teacher')) {
                // If the user is a Teacher, fetch the teacher data by userId
                return fetchTeacherByUserId(userId).then((teacher) => [
                  {
                    ...teacher,
                    fullName: `${teacher.user.firstName} ${teacher.user.lastName}`
                  }
                ]);
              } else {
                // If the user is not a Teacher, allow them to search for teachers
                return fetchTeachers(1, 5, query).then((data) =>
                  data.data.map((teacher: any) => ({
                    ...teacher,
                    fullName: `${teacher.firstName} ${teacher.lastName}`
                  }))
                );
              }
            }}
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
              setNewSession({
                ...newSession,
                studentIds: selectedItems.map((item: any) => item.id)
              });
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
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Additional Notes"
            fullWidth
            multiline
            rows={3}
            value={newSession.note}
            onChange={(e) =>
              setNewSession({ ...newSession, note: e.target.value })
            }
            variant="outlined"
          />
          {fieldErrors.note && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {fieldErrors.note}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

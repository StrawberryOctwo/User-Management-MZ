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
  RadioGroup,
  Radio,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Alert,
  Snackbar
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
import {
  recurrenceOptions,
  daysOfWeek,
  ClassSession
} from './AddClassSessionUtils';

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
  // Auth states
  const { userId, userRoles } = useAuth();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];

  // snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'warning' | 'info'
  >('info');

  // session states
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [sessionTypes, setSessionTypes] = useState<any[]>([]);
  const [recurrencePatternOption, setRecurrencePatternOption] =
    useState('weekly');
  const [dayDetails, setDayDetails] = useState<{
    [key: string]: { startTime: string; duration: number };
  }>({});
  const [newSession, setNewSession] = useState<ClassSession>({
    name: '',
    startDate: new Date(),
    endDate: new Date(),
    sessions: [],
    note: '',
    sessionType: '',
    isHolidayCourse: false,
    teacherId: 0,
    topicId: 0,
    locationId: passedLocations[0]?.id || 0,
    studentIds: []
  });

  // error states
  const [maxStudents, setMaxStudents] = useState(4);
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: string | null;
  }>({});
  const [studentError, setStudentError] = useState<string | null>(null);
  const [startTimeError, setStartTimeError] = useState<string | null>(null);

  const handleRecurrenceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRecurrenceOption = event.target.value;
    setRecurrencePatternOption(newRecurrenceOption);
    setDayDetails({});
  };

  const handleDayToggle = (
    event: React.MouseEvent<HTMLElement>,
    newDays: string[]
  ) => {
    setDayDetails((prev) => {
      const updatedDetails = { ...prev };

      // If the recurrence option is weekly, allow only one day to be selected
      if (recurrencePatternOption === 'weekly' && newDays.length > 1) {
        newDays = [newDays[newDays.length - 1]]; // Keep only the last selected day
      }

      newDays.forEach((day) => {
        if (!updatedDetails[day]) {
          updatedDetails[day] = { startTime: '', duration: 0 };
        }
      });

      Object.keys(updatedDetails).forEach((day) => {
        if (!newDays.includes(day)) {
          delete updatedDetails[day];
        }
      });

      return updatedDetails;
    });
  };

  const handleDayDetailChange = (day: string, field: string, value: any) => {
    setDayDetails((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSave = () => {
    // const errors: { [key: string]: string | null } = {};
    // // Validate required fields
    // if (!newSession.name.trim()) errors.name = t('errors.classNameRequired');
    // if (!newSession.startTime) errors.startTime = t('errors.startTimeRequired');
    // if (!selectedTeacher)
    //   errors.teacherId = t('errors.teacherSelectionRequired');
    // if (!selectedTopic) errors.topicId = t('errors.topicSelectionRequired');
    // if (!selectedLocation)
    //   errors.locationId = t('errors.locationSelectionRequired');
    // const allowedDurations = [45, 60, 90, 120];
    // if (!allowedDurations.includes(newSession.duration)) {
    //   errors.duration = t('errors.invalidDuration', {
    //     allowed: allowedDurations.join(', ')
    //   });
    // }
    // const { validatedStudents, error } = validateStudentSelection(
    //   newSession.sessionType,
    //   selectedStudents
    // );
    // if (error) {
    //   setStudentError(error);
    //   errors.studentIds = error;
    // } else {
    //   setStudentError(null);
    //   setNewSession((prevSession) => ({
    //     ...prevSession,
    //     studentIds: validatedStudents.map((student) => student.id)
    //   }));
    // }
    // setFieldErrors(errors);
    // if (Object.values(errors).some((error) => error !== null)) {
    //   return;
    // }
    // const sessionPayload = {
    //   ...newSession,
    //   locationId: selectedLocation?.id
    // };
    // onClose();

    newSession.sessions = Object.keys(dayDetails).map((day) => ({
      day,
      startTime: dayDetails[day].startTime,
      duration: dayDetails[day].duration
    }));

    console.log('newSession', newSession);
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    // Fetch session types when the component mounts
    const fetchData = async () => {
      const data = await fetchSessionTypes();
      setSessionTypes(data);
    };
    fetchData();

    // Update selected students and max students based on session type
    if (newSession.sessionType === '1on1') {
      setSelectedStudents((prev) => prev.slice(0, 1));
      setMaxStudents(1);
    } else {
      setMaxStudents(4);
    }

    // Update session name based on roomId
    if (roomId) {
      setNewSession((prev) => ({ ...prev, name: roomId as string }));
    }

    // Set selected location based on passedLocations
    if (isOpen && passedLocations && passedLocations[0]) {
      setSelectedLocation(passedLocations[0]);
    }
  }, [newSession.sessionType, roomId, isOpen, passedLocations]);

  const clearForm = () => {
    setSelectedStudents([]);
    setSelectedTeacher(null);
    setSelectedTopic(null);
    setSelectedLocation(null);
    setNewSession({
      name: '',
      startDate: new Date(),
      endDate: new Date(),
      sessions: [],
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

  const handleClose = () => {
    clearForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <DialogTitle>Add Class Session</DialogTitle>
      <DialogContent
        sx={{
          '&::-webkit-scrollbar': {
            width: '8px' // Adjust the width of the scrollbar
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888', // Color of the scrollbar thumb
            borderRadius: '4px' // Rounded corners for the scrollbar thumb
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#555' // Color of the scrollbar thumb on hover
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1' // Color of the scrollbar track
          }
        }}
      >
        <Grid container spacing={9}>
          {/* Left Column */}
          <Grid item xs={6}>
            <Box sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Room</InputLabel>
                <Select
                  label="Room"
                  value={newSession.name || ''}
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

              <FormControl
                fullWidth
                sx={{
                  mt: 1
                }}
              >
                <InputLabel>Session Type</InputLabel>
                <Select
                  label="Session Type"
                  value={newSession.sessionType}
                  onChange={(e) =>
                    setNewSession({
                      ...newSession,
                      sessionType: e.target.value
                    })
                  }
                >
                  {sessionTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ '& > *': { mb: 3, mt: 2 } }}>
                <SingleSelectWithAutocomplete
                  width={'100%'}
                  label="Search Teacher"
                  fetchData={(query: string | undefined) => {
                    if (strongestRoles.includes('Teacher')) {
                      return fetchTeacherByUserId(userId).then((teacher) => [
                        {
                          ...teacher,
                          fullName: `${teacher.user.firstName} ${teacher.user.lastName}`
                        }
                      ]);
                    } else {
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
                />
                <MultiSelectWithCheckboxes
                  width={'100%'}
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
                />
                <SingleSelectWithAutocomplete
                  width={'100%'}
                  label="Select Location"
                  fetchData={(query) =>
                    fetchLocations(1, 5, query).then((data) => data.data)
                  }
                  onSelect={(location) => setSelectedLocation(location)}
                  displayProperty="name"
                  placeholder="Search Location"
                  initialValue={selectedLocation}
                  disabled={true}
                />

                <SingleSelectWithAutocomplete
                  width={'100%'}
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
                />
              </Box>
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
            </Box>
          </Grid>

          {/* Right Column */}
          <Grid item xs={6}>
            <Box sx={{ mt: 1 }}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                value={moment(newSession.startDate).format('YYYY-MM-DD')}
                onChange={(e) => {
                  const newStartDate = new Date(e.target.value);
                  setNewSession({
                    ...newSession,
                    startDate: newStartDate
                  });
                }}
                error={!!fieldErrors.startDate}
                helperText={fieldErrors.startDate}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <TextField
                label="End Date"
                type="date"
                fullWidth
                value={moment(newSession.endDate).format('YYYY-MM-DD')}
                onChange={(e) => {
                  const newEndDate = new Date(e.target.value);
                  setNewSession({
                    ...newSession,
                    endDate: newEndDate
                  });
                }}
                error={!!fieldErrors.endDate}
                helperText={fieldErrors.endDate}
              />
            </Box>

            <Box sx={{ '& > *': { mt: 1, ml: 0.2 } }}>
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

            <Box
              sx={{
                mt: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <InputLabel sx={{ mb: 0, mr: 2, overflow: 'visible' }}>
                Repetition:
              </InputLabel>
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  row
                  value={recurrencePatternOption}
                  onChange={handleRecurrenceChange}
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

            <ToggleButtonGroup
              value={Object.keys(dayDetails)}
              onChange={handleDayToggle}
              aria-label="days of the week"
              sx={{ display: 'flex' }}
            >
              {daysOfWeek.map((day) => (
                <ToggleButton
                  key={day.value}
                  value={day.value}
                  aria-label={day.label}
                  sx={{
                    width: 40,
                    height: 40,
                    border: '1px solid #1976d2 !important', // Blue outline
                    color: '#1976d2', // Blue text color
                    '&.Mui-selected': {
                      backgroundColor: '#1976d2', // Blue background when selected
                      color: '#fff' // White text when selected
                    },
                    '&:hover': {
                      backgroundColor: '#e3f2fd', // Light blue hover effect
                      color: '#1976d2'
                    },
                    borderRadius: 0 // Square shape
                  }}
                >
                  {day.value}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {recurrencePatternOption === 'weekly' && (
              <Box sx={{ mt: 2 }}>
                {Object.keys(dayDetails)
                  .slice(0, 1)
                  .map((day) => (
                    <>
                      <Typography>Select Start Time and Duration:</Typography>

                      <Box
                        key={day}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mt: 1,
                          gap: 2
                        }}
                      >
                        <TextField
                          type="time"
                          sx={{ mr: 2 }}
                          value={dayDetails[day]?.startTime || ''}
                          onChange={(e) =>
                            handleDayDetailChange(
                              day,
                              'startTime',
                              e.target.value
                            )
                          }
                        />
                        <TextField
                          label="Duration (mins)"
                          type="number"
                          value={dayDetails[day]?.duration || ''}
                          onChange={(e) =>
                            handleDayDetailChange(
                              day,
                              'duration',
                              e.target.value
                            )
                          }
                          sx={{ width: '120px' }}
                        />
                      </Box>
                    </>
                  ))}
              </Box>
            )}
            {recurrencePatternOption === 'custom' && (
              <>
                {Object.keys(dayDetails).map((day) => (
                  <Box
                    key={day}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mt: 1,

                      padding: '8px',
                      gap: 2 // Space between elements
                    }}
                  >
                    <Box sx={{ width: '80px', fontWeight: 'bold' }}>
                      {daysOfWeek.find((d) => d.value === day).label}
                    </Box>
                    <TextField
                      label="Start Time"
                      type="time"
                      value={dayDetails[day]?.startTime || ''}
                      onChange={(e) =>
                        handleDayDetailChange(day, 'startTime', e.target.value)
                      }
                      sx={{ width: '120px' }}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Duration (mins)"
                      type="number"
                      value={dayDetails[day]?.duration || ''}
                      onChange={(e) =>
                        handleDayDetailChange(day, 'duration', e.target.value)
                      }
                      sx={{ width: '120px' }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                ))}
              </>
            )}
          </Grid>
        </Grid>
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

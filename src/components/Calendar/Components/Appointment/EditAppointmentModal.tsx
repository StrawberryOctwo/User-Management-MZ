import React, { useState, useEffect } from "react";
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
  Typography,
  FormControlLabel,
} from "@mui/material";
import moment from "moment";

import { t } from "i18next";
import SingleSelectWithAutocomplete from "src/components/SearchBars/SingleSelectWithAutocomplete";
import MultiSelectWithCheckboxes from "src/components/SearchBars/MultiSelectWithCheckboxes";
import { fetchClassSessionById, updateClassSession } from "src/services/classSessionService";
import { fetchStudents } from "src/services/studentService";
import { fetchTeachers } from "src/services/teacherService";
import { fetchTopics } from "src/services/topicService";
import { fetchLocations } from "src/services/locationService";
import { fetchSessionTypes } from "src/services/contractPackagesService";

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  onSave: (updatedAppointment: any) => void;
  loadClassSessions: () => void; // Add this prop
}

export default function EditAppointmentModal({
  isOpen,
  onClose,
  appointmentId,
  onSave,
  loadClassSessions, // Destructure the prop
}: EditAppointmentModalProps) {
  const [editedAppointment, setEditedAppointment] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string | null }>({});
  const [studentError, setStudentError] = useState<string | null>(null);
  const [startTimeError, setStartTimeError] = useState<string | null>(null);
  const [endTimeError, setEndTimeError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null); 
  const [sessionTypes, setSessionTypes] = useState<any[]>([]); 

  useEffect(() => {
    const fetchSessionTypeOptions = async () => {
      try {
        const types = await fetchSessionTypes();
        setSessionTypes(types);
      } catch (error) {
        console.error("Failed to fetch session types", error);
      }
    };

    fetchSessionTypeOptions();
  }, []);
  useEffect(() => {
    if (appointmentId && isOpen) {
      const fetchClassSession = async () => {
        setLoading(true);
        try {
          const session = await fetchClassSessionById(appointmentId);
          setEditedAppointment(session);

          // Preload teacher with full name
          const teacher = session.teacher
            ? { id: session.teacher.id, fullName: `${session.teacher.user.firstName} ${session.teacher.user.lastName}` }
            : null;
          setSelectedTeacher(teacher);

          // Preload students with full names
          const students = session.students?.map((student: any) => ({
            id: student.id,
            fullName: `${student.user.firstName} ${student.user.lastName}`,
          })) || [];
          setSelectedStudents(students);

          // Preload topic
          setSelectedTopic(session.topic);

          // Preload location
          if (session.location) {
            setSelectedLocation({
              id: session.location.id,
              name: session.location.name,
            });
          }
        } catch (error) {
          setErrorMessage("Failed to fetch class session");
        } finally {
          setLoading(false);
        }
      };
      fetchClassSession();
    }
  }, [appointmentId, isOpen]);


  const validateTime = (date: Date | null, type: 'start' | 'end'): boolean => {
    if (date) {
      const hour = date.getHours();
      if (hour < 9 || hour > 20) {
        if (type === 'start') {
          setStartTimeError(t('errors.invalidStartTime'));
        } else {
          setEndTimeError(t('errors.invalidEndTime'));
        }
        return false; // Indicates invalid time
      } else {
        if (type === 'start') {
          setStartTimeError(null);
        } else {
          setEndTimeError(null);
        }
        return true; // Indicates valid time
      }
    }
    return false;
  };


  const validateStudentSelection = (
    sessionType: string,
    students: any[],
    maxGroupSize: number = 4
  ): { validatedStudents: any[]; error: string | null } => {
    if (sessionType === '1on1' && students.length !== 1) {
      return {
        validatedStudents: students.slice(0, 1),
        error: t('errors.oneStudentRequired'),
      };
    } else if (sessionType === 'Group' && students.length > maxGroupSize) {
      return {
        validatedStudents: students.slice(0, maxGroupSize),
        error: t('errors.maxStudentsExceeded', { max: maxGroupSize }),
      };
    }
    // For 'Online' or valid 'Group' session, no restriction
    return {
      validatedStudents: students,
      error: null,
    };
  };


  const handleSave = async () => {
    if (editedAppointment) {
      // Validate all required fields
      const errors: { [key: string]: string | null } = {};

      if (!editedAppointment.name.trim()) errors.name = t('errors.classNameRequired');
      if (!editedAppointment.sessionStartDate) errors.sessionStartDate = t('errors.startTimeRequired');
      if (!editedAppointment.sessionEndDate) errors.sessionEndDate = t('errors.endTimeRequired');
      if (!selectedTeacher) errors.teacherId = t('errors.teacherSelectionRequired');
      if (!selectedTopic) errors.topicId = t('errors.topicSelectionRequired');
      if (!selectedLocation) errors.locationId = t('errors.locationSelectionRequired'); // Validate location

      // Validate student selection based on the session type
      const { validatedStudents, error } = validateStudentSelection(
        editedAppointment.sessionType,
        selectedStudents,
        4
      );
      if (error) {
        setStudentError(error);
        errors.studentIds = error;
      } else {
        setStudentError(null);
      }

      setFieldErrors(errors);

      // Validate the time fields
      const isStartTimeValid = validateTime(new Date(editedAppointment.sessionStartDate), 'start');
      const isEndTimeValid = validateTime(new Date(editedAppointment.sessionEndDate), 'end');

      if (
        Object.values(errors).some((error) => error !== null) ||
        !isStartTimeValid ||
        !isEndTimeValid
      ) {
        return; // Exit if any errors exist or if times are invalid
      }

      const { teacher, topic, students, ...restAppointment } = editedAppointment;


      const updatedSession = {
        ...restAppointment,
        teacherId: selectedTeacher?.id || null,
        topicId: selectedTopic?.id || null,
        locationId: selectedLocation?.id || null,
        studentIds: validatedStudents.map((student) => student.id),
        sessionType: editedAppointment.sessionType.id,
      };

      try {
        setLoading(true);
        await updateClassSession(appointmentId, updatedSession);
        loadClassSessions(); // Call the function directly
        onClose();
      } catch (error) {
        setErrorMessage("Failed to update class session");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Class Session</DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : errorMessage ? (
          <Typography color="error">{errorMessage}</Typography>
        ) : (
          editedAppointment && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Room</InputLabel>
                  <Select
                    label="Room"
                    value={editedAppointment.name || ""}
                    onChange={(e) =>
                      setEditedAppointment({ ...editedAppointment, name: e.target.value })
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



              <FormControl fullWidth margin="normal">
                <InputLabel>Session Type</InputLabel>
                <Select
                  label="Session Type"
                  value={editedAppointment.sessionType.id || ""}
                  onChange={(e) => {
                    const selectedType = sessionTypes.find(type => type.id === e.target.value);
                    setEditedAppointment({
                      ...editedAppointment,
                      sessionType: { id: selectedType.id, name: selectedType.name },
                    });
                  }}                >
                  {sessionTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 1 }}>
                <TextField
                  label="Start Time"
                  type="datetime-local"
                  value={moment(editedAppointment.sessionStartDate).format("YYYY-MM-DDTHH:mm")}
                  onChange={(e) => {
                    const newStartDate = new Date(e.target.value);
                    setEditedAppointment({
                      ...editedAppointment,
                      sessionStartDate: newStartDate,
                    });
                    validateTime(newStartDate, 'start');
                  }}
                  fullWidth
                  error={!!fieldErrors.sessionStartDate || !!startTimeError}
                  helperText={fieldErrors.sessionStartDate || startTimeError}
                />
                <TextField
                  label="End Time"
                  type="datetime-local"
                  value={moment(editedAppointment.sessionEndDate).format('YYYY-MM-DDTHH:mm')}
                  onChange={(e) => {
                    const newEndDate = new Date(e.target.value);
                    setEditedAppointment({
                      ...editedAppointment,
                      sessionEndDate: newEndDate,
                    });
                    validateTime(newEndDate, 'end');
                  }}
                  fullWidth
                  error={!!fieldErrors.sessionEndDate || !!endTimeError}
                  helperText={fieldErrors.sessionEndDate || endTimeError}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={editedAppointment.isActive}
                    onChange={(e) =>
                      setEditedAppointment({ ...editedAppointment, isActive: e.target.checked })
                    }
                  />
                }
                label="Is Active"
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={editedAppointment.isHolidayCourse}
                    onChange={(e) =>
                      setEditedAppointment({ ...editedAppointment, isHolidayCourse: e.target.checked })
                    }
                  />
                }
                label="Is Holiday Course"
                sx={{ mb: 2 }}
              />

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
                  fetchData={(query: string) => fetchTopics(1, 5, query).then((response) => response.data)}
                  onSelect={(topic) => {
                    setSelectedTopic(topic);
                    setEditedAppointment({ ...editedAppointment, topicId: topic?.id });
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
                  fetchData={(query: string) =>
                    fetchTeachers(1, 5, query).then((data) =>
                      data.data.map((teacher: any) => ({
                        ...teacher,
                        fullName: `${teacher.firstName} ${teacher.lastName}`,
                      }))
                    )
                  }
                  onSelect={(teacher) => {
                    setSelectedTeacher(teacher);
                    setEditedAppointment({ ...editedAppointment, teacherId: teacher?.id });
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
                  fetchData={(query: string) =>
                    fetchStudents(1, 5, query).then((data) =>
                      data.data.map((student: any) => ({
                        ...student,
                        fullName: `${student.firstName} ${student.lastName}`,
                      }))
                    )
                  }
                  onSelect={(selectedItems) => {
                    setSelectedStudents(selectedItems);
                    setEditedAppointment({ ...editedAppointment, studentIds: selectedItems.map((item: any) => item.id) });
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
            </Box>
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained" disabled={loading}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

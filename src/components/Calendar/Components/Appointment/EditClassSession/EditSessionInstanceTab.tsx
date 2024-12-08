import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  fetchTeacherByUserId,
  fetchTeachers
} from 'src/services/teacherService'; // Adjust the import path as needed
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import { useAuth } from 'src/hooks/useAuth';
import { getStrongestRoles } from 'src/hooks/roleUtils';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import { fetchStudents } from 'src/services/studentService';
import { fetchSessionTypes } from 'src/services/contractPackagesService';
import { allowedDurations } from '../AddClassSession/AddClassSessionUtils';
import { useTranslation } from 'react-i18next';


const EditSessionInstanceTab = ({
  session,
  setSession,
  editSession,
  sessionEnded
}) => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const { userId, userRoles } = useAuth();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];
  const [sessionTypes, setSessionTypes] = useState([]);
  const { t } = useTranslation();
  useEffect(() => {
    const loadSessionTypes = async () => {
      try {
        const response = await fetchSessionTypes(1, 5, '');
        setSessionTypes(response.data);
      } catch (error) {
        console.error('Error fetching session types:', error);
      }
    };

    loadSessionTypes();
  }, []);

  useEffect(() => {
    if (editSession) {
      const { teacher, students } = editSession;

      setSession((prevSession) => ({
        ...prevSession,
        date: editSession.date || '',
        startTime: editSession.startTime || '',
        duration: editSession.duration || '',
        isActive: editSession.isActive || false,
        sessionType: editSession.sessionType?.id || null,
        teacherId: teacher?.id || null,
        studentIds: students?.map((s) => s.id) || [],
        room: editSession.room || '',
        note: editSession.note || ''
      }));

      setSelectedTeacher(
        teacher
          ? {
              id: teacher.id,
              fullName: `${teacher.user.firstName} ${teacher.user.lastName}`
            }
          : null
      );

      setSelectedStudents(
        students?.map((student) => ({
          id: student.id,
          fullName: `${student.user.firstName} ${student.user.lastName}`
        })) || []
      );
    }
  }, [editSession, setSession]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="is-active-label">Status</InputLabel>
            <Select
              labelId="is-active-label"
              id="is-active-select"
              value={session.isActive ? 'active' : 'inactive'}
              onChange={(e) =>
                setSession({
                  ...session,
                  isActive: e.target.value === 'active'
                })
              }
              label={t("Status")}
              disabled={sessionEnded}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            label={t("Date")}
            type="date"
            fullWidth
            value={session.date}
            onChange={(e) => setSession({ ...session, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            disabled={sessionEnded}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label={t("Start Time")}
            type="time"
            fullWidth
            value={session.startTime}
            onChange={(e) =>
              setSession({ ...session, startTime: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            disabled={sessionEnded}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel shrink>Duration (minutes)</InputLabel>
            <Select
              label={t("Duration (minutes)")}
              value={session.duration}
              onChange={(e) =>
                setSession({ ...session, duration: e.target.value })
              }
              disabled={sessionEnded}
            >
              {allowedDurations.map((duration) => (
                <MenuItem key={duration} value={duration}>
                  {duration} minutes
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <SingleSelectWithAutocomplete
              disabled={sessionEnded}
              width="100%"
              label={t("Search Teacher")}
              fetchData={(query) =>
                strongestRoles.includes('Teacher')
                  ? fetchTeacherByUserId(userId).then((teacher) => [
                      {
                        ...teacher,
                        fullName: `${teacher.user.firstName} ${teacher.user.lastName}`
                      }
                    ])
                  : fetchTeachers(1, 5, query).then((data) =>
                      data.data.map((teacher) => ({
                        ...teacher,
                        fullName: `${teacher.firstName} ${teacher.lastName}`
                      }))
                    )
              }
              onSelect={(teacher) => {
                setSession({ ...session, teacherId: teacher?.id });
              }}
              displayProperty="fullName"
              placeholder="Search Teacher"
              initialValue={selectedTeacher}
            />
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <MultiSelectWithCheckboxes
              disabled={sessionEnded}
              width="100%"
              label={t("Search Students")}
              fetchData={(query) =>
                fetchStudents(1, 5, query).then((data) =>
                  data.data.map((student) => ({
                    ...student,
                    fullName: `${student.firstName} ${student.lastName}`
                  }))
                )
              }
              onSelect={(selectedItems) => {
                setSession({
                  ...session,
                  studentIds: selectedItems.map((item) => item.id)
                });
              }}
              displayProperty="fullName"
              placeholder="Enter student name"
              initialValue={selectedStudents}
            />
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Room</InputLabel>
            <Select
              disabled={sessionEnded}
              label={t("Room")}
              value={session.room || ''}
              onChange={(e) => setSession({ ...session, room: e.target.value })}
            >
              {Array.from({ length: 7 }, (_, index) => (
                <MenuItem key={index} value={`R${index + 1}`}>
                  {`R${index + 1}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Session Type</InputLabel>
            <Select
              disabled={sessionEnded}
              label={t("Session Type")}
              value={session.sessionType || ''}
              onChange={(e) =>
                setSession({ ...session, sessionType: e.target.value })
              }
            >
              {sessionTypes.length > 0 ? (
                sessionTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  No options available
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <TextField
        label={t("Note")}
        multiline
        rows={4}
        fullWidth
        value={session.note}
        onChange={(e) => setSession({ ...session, note: e.target.value })}
      />
    </Box>
  );
};

export default EditSessionInstanceTab;

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
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

const EditSessionInstanceTab = ({ session, setSession }) => {
  const [teachers, setTeachers] = useState([]);
  const { userId, userRoles } = useAuth();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchTeachers(1, 100); // Fetch teachers (adjust the parameters as needed)
      setTeachers(response.data);
    };

    fetchData();
  }, []);

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
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Date"
            type="date"
            fullWidth
            value={session.date}
            onChange={(e) => setSession({ ...session, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Start Time"
            type="time"
            fullWidth
            value={session.startTime}
            onChange={(e) =>
              setSession({ ...session, startTime: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Duration (minutes)"
            type="number"
            fullWidth
            value={session.duration}
            onChange={(e) =>
              setSession({ ...session, duration: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <SingleSelectWithAutocomplete
              width="100%"
              label="Search Teacher"
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
              initialValue={teachers.find((t) => t.id === session.teacherId)}
            />
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <MultiSelectWithCheckboxes
              width="100%"
              label="Search Students"
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
              initialValue={session.students}
            />
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Room</InputLabel>
            <Select
              label="Room"
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
      </Grid>
      <TextField
        label="Note"
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

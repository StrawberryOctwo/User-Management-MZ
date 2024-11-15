import React from 'react';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import RecurrenceOptions from './RecurrenceOptions';
import DateFields from './DateFields';

export default function FormFields({
  newSession,
  setNewSession,
  selectedTeacher,
  setSelectedTeacher,
  selectedStudents,
  setSelectedStudents,
  selectedLocation,
  setSelectedLocation,
  selectedTopic,
  setSelectedTopic,
  strongestRoles,
  userId,
  fetchTeacherByUserId,
  fetchTeachers,
  fetchStudents,
  fetchLocations,
  fetchTopics,
  sessionTypes,
  recurrencePatternOption,
  setRecurrencePatternOption,
  dayDetails,
  handleDayDetailChange,
  handleDayToggle,
  fieldErrors,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '90vw', // Slightly increased width for modal
        maxWidth: '900px', // Set a max width for large screens
        padding: 3, // Reduced padding around the content
        boxSizing: 'border-box',
      }}
    >

      {/* Two-column layout */}
      <Grid container spacing={2}> {/* Reduced spacing */}
        {/* Left Column */}
        <Grid item xs={12} md={6}>
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

          <FormControl fullWidth sx={{ mt: 2 }}>
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

          <SingleSelectWithAutocomplete
            width="100%"
            label="Search Teacher"
            fetchData={(query) =>
              strongestRoles.includes('Teacher')
                ? fetchTeacherByUserId(userId).then((teacher) => [
                    {
                      ...teacher,
                      fullName: `${teacher.user.firstName} ${teacher.user.lastName}`,
                    },
                  ])
                : fetchTeachers(1, 5, query).then((data) =>
                    data.data.map((teacher) => ({
                      ...teacher,
                      fullName: `${teacher.firstName} ${teacher.lastName}`,
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
          />

          <MultiSelectWithCheckboxes
            width="100%"
            label="Search Students"
            fetchData={(query) =>
              fetchStudents(1, 5, query).then((data) =>
                data.data.map((student) => ({
                  ...student,
                  fullName: `${student.firstName} ${student.lastName}`,
                }))
              )
            }
            onSelect={(selectedItems) => {
              setSelectedStudents(selectedItems);
              setNewSession({
                ...newSession,
                studentIds: selectedItems.map((item) => item.id),
              });
            }}
            displayProperty="fullName"
            placeholder="Enter student name"
            initialValue={selectedStudents}
          />

          <SingleSelectWithAutocomplete
            width="100%"
            label="Select Location"
            fetchData={(query) =>
              fetchLocations(1, 5, query).then((data) => data.data)
            }
            onSelect={(location) => setSelectedLocation(location)}
            displayProperty="name"
            placeholder="Search Location"
            initialValue={selectedLocation}
          />

          <SingleSelectWithAutocomplete
            width="100%"
            label="Search Topic"
            fetchData={(query) =>
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

          <DateFields
            newSession={newSession}
            setNewSession={setNewSession}
            fieldErrors={fieldErrors}
          />
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          <RecurrenceOptions
            recurrencePatternOption={recurrencePatternOption}
            handleRecurrenceChange={setRecurrencePatternOption}
            handleDayToggle={handleDayToggle}
            dayDetails={dayDetails}
            handleDayDetailChange={handleDayDetailChange}
          />

          <TextField
            label="Additional Notes"
            fullWidth
            multiline
            rows={4} // Reduced number of rows to save space
            value={newSession.note || ''}
            onChange={(e) =>
              setNewSession({ ...newSession, note: e.target.value })
            }
            sx={{ mt: 4 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={newSession.isHolidayCourse}
                onChange={(e) =>
                  setNewSession({
                    ...newSession,
                    isHolidayCourse: e.target.checked,
                  })
                }
              />
            }
            label="Is Holiday Course"
            sx={{ mt: 3 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox
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
  resetDayDetails,
  dayDetails,
  handleDayDetailChange,
  handleDayToggle,
  fieldErrors
}) {
  return (
    <Grid container spacing={14} p={1}>
      {/* Left Column */}
      <Grid item xs={12} md={6}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ mb: 3 }}>
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
          </Box>

          <Box sx={{ mb: 3 }}>
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
        </Box>

        <Box sx={{ mb: 3 }}>
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
              setSelectedTeacher(teacher);
              setNewSession({ ...newSession, teacherId: teacher?.id });
            }}
            displayProperty="fullName"
            placeholder="Search Teacher"
            initialValue={selectedTeacher}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
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
              setSelectedStudents(selectedItems);
              setNewSession({
                ...newSession,
                studentIds: selectedItems.map((item) => item.id)
              });
            }}
            displayProperty="fullName"
            placeholder="Enter student name"
            initialValue={selectedStudents}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
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
            disabled={!strongestRoles.includes('Teacher')}
          />
        </Box>

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
      </Grid>

      {/* Right Column */}
      <Grid item xs={12} md={6}>
        <Box sx={{ mb: 1 }}>
          <DateFields
            newSession={newSession}
            setNewSession={setNewSession}
            fieldErrors={fieldErrors}
          />
        </Box>
        <Box sx={{ mb: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={newSession.isHolidayCourse}
                onChange={(e) =>
                  setNewSession({
                    ...newSession,
                    isHolidayCourse: e.target.checked
                  })
                }
              />
            }
            label="Holiday Course"
            labelPlacement="start"
            sx={{ ml: 0 }}
          />
        </Box>
        <Box>
          <RecurrenceOptions
            recurrencePatternOption={recurrencePatternOption}
            handleRecurrenceChange={setRecurrencePatternOption}
            handleDayToggle={handleDayToggle}
            dayDetails={dayDetails}
            handleDayDetailChange={handleDayDetailChange}
            resetDayDetails={resetDayDetails}
          />
        </Box>
      </Grid>
    </Grid>
  );
}

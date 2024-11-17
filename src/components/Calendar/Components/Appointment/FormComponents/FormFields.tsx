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
import { fetchTopics } from 'src/services/topicService';
import { useEffect, useState } from 'react';
import {
  fetchTeacherByUserId,
  fetchTeachers
} from 'src/services/teacherService';
import { fetchStudents } from 'src/services/studentService';
import { fetchLocations } from 'src/services/locationService';
import { useSession } from '../../SessionContext';

export default function FormFields({
  strongestRoles,
  userId,
  roomId,
  editSession,
  passedLocations = null
}: {
  strongestRoles: string[];
  userId: number | number;
  roomId?: string | number;
  editSession?: any;
  passedLocations?: any[] | null;
}) {
  const { session, setSession, setDayDetail, resetDayDetails } = useSession();

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    console.log('editSession:', editSession);

    if (editSession) {
      const { classSession, teacher, location, students } = editSession;

      setSession((prevSession) => ({
        ...prevSession,
        topicId: classSession?.topic?.id || null,
        sessionType: classSession?.sessionType?.id || null,
        teacherId: teacher?.id || null,
        locationId: location?.id || null,
        studentIds: students?.map((s) => s.id) || [],
        room: editSession.room || '',
        startDate: editSession.date || prevSession.startDate,
        endDate: editSession.date || prevSession.endDate,
        note: editSession.note || prevSession.note,
        isHolidayCourse: classSession?.isHolidayCourse || false,
        recurrenceOption: prevSession.recurrenceOption,
        dayDetails: prevSession.dayDetails
      }));

      // Prepopulate input states
      setSelectedTopic({
        id: classSession?.topic?.id,
        name: classSession?.topic?.name
      });
      setSelectedTeacher({
        id: teacher?.id,
        fullName: `${teacher?.user?.firstName} ${teacher?.user?.lastName}`
      });
      setSelectedStudents(
        students?.map((student) => ({
          id: student.id,
          fullName: `${student.user?.firstName} ${student.user?.lastName}`
        })) || []
      );
      setSelectedLocation({
        id: location?.id,
        name: location?.name
      });
    } else {
      // Handle "Add" mode
      setSession((prevSession) => ({
        ...prevSession,
        locationId: passedLocations?.[0]?.id || null,
        room: roomId?.toString() || ''
      }));
      setSelectedLocation({
        id: passedLocations?.[0]?.id,
        name: passedLocations?.[0]?.name
      });
    }
  }, [editSession, passedLocations, roomId, setSession]);

  return (
    <Grid container spacing={10} p={1}>
      {/* Left Column */}
      <Grid item xs={12} md={6}>
        <Box sx={{ mb: 3 }}>
          <SingleSelectWithAutocomplete
            width="100%"
            label="Search Topic"
            fetchData={(query) =>
              fetchTopics(1, 5, query).then((response) => response.data)
            }
            onSelect={(topic) => setSession({ ...session, topicId: topic?.id })}
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
              value={session.sessionType || ''}
              onChange={(e) =>
                setSession({ ...session, sessionType: e.target.value })
              }
            >
              <MenuItem value={1}>Group</MenuItem>
              <MenuItem value={2}>Individual</MenuItem>
            </Select>
          </FormControl>
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
                    data.data.map((teacher: any) => ({
                      ...teacher,
                      fullName: `${teacher.firstName} ${teacher.lastName}`
                    }))
                  )
            }
            onSelect={(teacher) =>
              setSession({ ...session, teacherId: teacher?.id })
            }
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
            onSelect={(selectedItems) =>
              setSession({
                ...session,
                studentIds: selectedItems.map((item) => item.id)
              })
            }
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
            onSelect={(location) =>
              setSession({ ...session, locationId: location?.id })
            }
            displayProperty="name"
            placeholder="Search Location"
            initialValue={selectedLocation}
          />
        </Box>

        <FormControl fullWidth>
          <InputLabel>Room</InputLabel>
          <Select
            label="Room"
            value={session.room || ''}
            onChange={(e) => setSession({ ...session, room: e.target.value })}
          >
            {Array.from(
              { length: passedLocations?.[0]?.numberOfRooms || 7 },
              (_, index) => (
                <MenuItem key={index} value={`R${index + 1}`}>
                  {`R${index + 1}`}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
      </Grid>

      {/* Right Column */}
      <Grid item xs={12} md={6}>
        <Box sx={{ mb: 1 }}>
          <DateFields session={session} setSession={setSession} />
        </Box>
        <Box sx={{ mb: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={session.isHolidayCourse || false}
                onChange={(e) =>
                  setSession({
                    ...session,
                    isHolidayCourse: e.target.checked
                  })
                }
              />
            }
            label="Holiday Course"
          />
        </Box>
        <Box>
          <RecurrenceOptions
            recurrenceOption={session.recurrenceOption}
            handleRecurrenceChange={(e) =>
              setSession({
                ...session,
                recurrenceOption: e.target.value as string
              })
            }
            dayDetails={session.dayDetails}
            setDayDetail={setDayDetail}
            resetDayDetails={resetDayDetails}
          />
        </Box>
      </Grid>
    </Grid>
  );
}

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
import { useSession } from '../../SessionContext';
import { fetchTopics } from 'src/services/topicService';
import { useEffect, useState } from 'react';
import { fetchSessionTypes } from 'src/services/contractPackagesService';
import {
  fetchTeacherByUserId,
  fetchTeachers
} from 'src/services/teacherService';
import { fetchStudents } from 'src/services/studentService';
import { fetchLocations } from 'src/services/locationService';

export default function FormFields({
  strongestRoles,
  userId,
  roomId,
  editSession
}) {
  const {
    session,
    setSession,
    setSessionField,
    setDayDetail,
    resetDayDetails
  } = useSession();

  const [sessionTypes, setSessionTypes] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (editSession) {
      // setSession(editSession);
      console.log('editSession:', editSession);
      // setSessionField('topicId', editSession.topic?.id);
      // setSessionField('sessionType', editSession.sessionType?.id);
      // setSessionField('teacherId', editSession.teacherId);
      // setSessionField('locationId', editSession.location?.id);
      // // setSessionField('studentIds', editSession.students.map((s) => s?.id));
      // setSessionField('name', editSession.name);

    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const sessionTypesResponse = await fetchSessionTypes();
      setSessionTypes(sessionTypesResponse || []);

      if (session.topicId) {
        const topicsResponse = await fetchTopics(1, 5, '');
        const topic = topicsResponse.data.find((t) => t.id === session.topicId);
        setSelectedTopic(topic);
      }

      if (session.teacherId) {
        const teacher = await fetchTeacherByUserId(session.teacherId);
        setSelectedTeacher({
          ...teacher,
          fullName: `${teacher.user.firstName} ${teacher.user.lastName}`
        });
      }

      if (session.studentIds.length > 0) {
        const studentsResponse = await fetchStudents(1, 5, '');
        const students = studentsResponse.data.filter((student) =>
          session.studentIds.includes(student.id)
        );
        setSelectedStudents(
          students.map((student) => ({
            ...student,
            fullName: `${student.firstName} ${student.lastName}`
          }))
        );
      }

      if (session.locationId) {
        const locationsResponse = await fetchLocations(1, 5, '');
        const location = locationsResponse.data.find(
          (loc) => loc.id === session.locationId
        );
        setSelectedLocation(location);
      }
    };

    fetchData();
  }, [
    session.topicId,
    session.teacherId,
    session.studentIds,
    session.locationId
  ]);

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
                setSession({ ...session, topicId: topic?.id });
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
                value={session.sessionType}
                onChange={(e) =>
                  setSession({ ...session, sessionType: e.target.value })
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
              setSession({ ...session, teacherId: teacher?.id });
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
              setSession({
                ...session,
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
            onSelect={(location) => {
              setSession({ ...session, locationId: location?.id });
            }}
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
            value={session.name || ''}
            onChange={(e) => setSession({ ...session, name: e.target.value })}
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
          <DateFields session={session} setSession={setSession} />
        </Box>
        <Box sx={{ mb: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={session.isHolidayCourse}
                onChange={(e) =>
                  setSession({
                    ...session,
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
            recurrenceOption={session.recurrenceOption}
            handleRecurrenceChange={(
              e: React.ChangeEvent<{ value: unknown }>
            ) =>
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

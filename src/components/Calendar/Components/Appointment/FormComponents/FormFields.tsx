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
import { fetchSessionTypes } from 'src/services/contractPackagesService';
import { t } from 'i18next';

export default function FormFields({
  strongestRoles,
  userId,
  roomId,
  editSession,
  passedLocations = null,
  isPartial
}: {
  strongestRoles: string[];
  userId: number | number;
  roomId?: string | number;
  editSession?: any;
  passedLocations?: any[] | null;
  isPartial?: boolean;
}) {
  const { session, setSession, setDayDetail, resetDayDetails } = useSession();

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [sessionTypes, setSessionTypes] = useState([]);

  useEffect(() => {
    if (editSession) {
      // Logic for Edit Modal
      const { classSession, teacher, location, students } = editSession;

      setSession((prevSession) => ({
        ...prevSession,
        topicId: classSession?.topic?.id || null,
        sessionType: editSession?.sessionType?.id || null,
        teacherId: teacher?.id || null,
        locationId: location?.id || null,
        studentIds: students?.map((s) => s.id) || [],
        room: editSession.room || '',
        startDate: isPartial
          ? new Date()
          : editSession.classSession.startDate || prevSession.startDate,
        endDate: editSession.classSession.endDate || prevSession.endDate,
        note: editSession.note || prevSession.note,
        isHolidayCourse: classSession?.isHolidayCourse || false,
        recurrenceOption: editSession.classSession.recurrencePattern,
        dayDetails: editSession.classSession.days
      }));

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

      setSelectedLocation(location);
    } else {
      setSession((prevSession) => ({
        ...prevSession,
        locationId: passedLocations?.[0]?.id || null,
        room: String(roomId || '')
      }));
      setSelectedLocation(passedLocations?.[0] || null);
    }
  }, [editSession, passedLocations, roomId, setSession]);

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

  return (
    <Grid container spacing={10} p={1}>
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
              label={t("sessionType")}
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
            onSelect={(location) => {
              setSession({ ...session, locationId: location?.id });
              setSelectedLocation(location);
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
            value={session.room || ''}
            onChange={(e) => setSession({ ...session, room: e.target.value })}
          >
            {Array.from(
              {
                length:
                  selectedLocation?.numberOfRooms ||
                  passedLocations?.[0]?.numberOfRooms ||
                  0
              },
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
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          pt: '80px !important'
        }}
      >
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
            labelPlacement="start"
            sx={{ marginLeft: 0 }}
          />
        </Box>
        <Box sx={{ mb: 4 }}>
          <RecurrenceOptions
            recurrenceOption={session.recurrenceOption}
            handleRecurrenceChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
        <Box>
          <DateFields
            session={session}
            setSession={setSession}
            isPartial={isPartial}
          />
        </Box>
      </Grid>
    </Grid>
  );
}

import React, {
  useState,
  useCallback,
  useMemo,
  cloneElement,
  useEffect
} from 'react';
import { Box } from '@mui/material';
import moment from 'moment';
import { EventProps, Views } from 'react-big-calendar';
import Calendar from '../Calendar';

import 'react-datepicker/dist/react-datepicker.css';
import './index.css'; // Your custom styles
import EditAppointmentModal from '../Appointment/EditAppointmentModal'; // Import the Edit Appointment Modal
import AddClassSessionModal from '../Appointment/AddClassSessionModal';
import ClassSessionDetailsModal from '../Modals/ClassSessionDetailsModal';
import { getStrongestRoles } from 'src/hooks/roleUtils';
import { useAuth } from 'src/hooks/useAuth';
import { deleteClassSession } from 'src/services/classSessionService';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import EventItem from '../Appointment/EventItem';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export enum TimeSlotMinutes {
  Five = 5,
  Ten = 10,
  Fifteen = 15,
  Thirty = 30
}
type Keys = keyof typeof Views;

type DemoProps = {
  classSessionEvents: any[]; // Accept classSessionEvents as a prop
  onDateChange: (date: string) => void; // New prop to pass the date change handler
  handleSaveClassSession: (newSession: any) => void; // Accept as a prop
  loadClassSessions: () => void; // Add this prop
};

export default function CustomizedCalendar({
  classSessionEvents,
  onDateChange,
  handleSaveClassSession,
  loadClassSessions
}: DemoProps) {
  const [date, setDate] = useState<Date>(moment().toDate());
  const [view, setView] = useState<typeof Views[Keys]>(Views.DAY);
  const [contextMenuInfo, setContextMenuInfo] = useState<{
    xPosition: number;
    yPosition: number;
    selectedTime: string;
    resourceId: number;
  }>();

  const STEP = 15;
  const TIME_SLOTS = 60 / STEP;

  // State for managing selected event and modal visibility
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [canEditSession, setCanEditSession] = useState<boolean | null>(true);
  const [canAddReport, setCanAddReport] = useState<boolean | null>(false);
  const [events, setEvents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedRange, setSelectedRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date(),
    end: new Date()
  });

  const { userRoles } = useAuth();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];

  const onPrevClick = useCallback(() => {
    if (view === Views.DAY) {
      setDate(moment(date).subtract(1, 'd').toDate());
    } else if (view === Views.WEEK) {
      setDate(moment(date).subtract(1, 'w').toDate());
    } else {
      setDate(moment(date).subtract(1, 'M').toDate());
    }
  }, [view, date]);

  const onNextClick = useCallback(() => {
    if (view === Views.DAY) {
      setDate(moment(date).add(1, 'd').toDate());
    } else if (view === Views.WEEK) {
      setDate(moment(date).add(1, 'w').toDate());
    } else {
      setDate(moment(date).add(1, 'M').toDate());
    }
  }, [view, date]);

  const dateText = useMemo(() => {
    if (view === Views.DAY) return moment(date).format('dddd, MMMM DD');
    if (view === Views.WEEK) {
      const from = moment(date)?.startOf('week');
      const to = moment(date)?.endOf('week');
      return `${from.format('MMMM DD')} to ${to.format('MMMM DD')}`;
    }
  }, [view, date]);

  const onTodayClick = useCallback(() => {
    setDate(moment().toDate());
  }, []);

  const handleEventClick = (event: any) => {
    const eventEndDate = new Date(event.end);
    const currentDate = new Date();

    if (currentDate > eventEndDate) {
      console.warn('This event has already ended.');
      // setCanEditSession(false);
      setCanAddReport(false);
    } else if (currentDate < eventEndDate) {
      setCanAddReport(true);
      setCanEditSession(true);
    }

    if (strongestRoles[0] === 'Parent' || strongestRoles[0] === 'Student') {
      return;
    }

    if (
      strongestRoles[0] === 'Teacher' ||
      strongestRoles[0] === 'Parent' ||
      strongestRoles[0] === 'Student'
    ) {
      setCanEditSession(false);
    }

    const appointmentId = event.id;
    if (appointmentId) {
      setSelectedAppointmentId(appointmentId);
      setDetailsModalOpen(true);
    } else {
      console.error('Event ID is undefined or not available.');
    }
  };

  const handleEditClassSession = () => {
    if (strongestRoles[0] == 'Teacher' || strongestRoles[0] == 'Student') {
      return;
    }
    if (selectedAppointmentId) {
      setSelectedAppointment(selectedAppointmentId);
      setDetailsModalOpen(false);
      setModalOpen(true);
    } else {
      console.error('No appointment ID selected for editing.');
    }
  };

  const handleDeleteClassSession = () => {
    if (strongestRoles[0] == 'Teacher' || strongestRoles[0] == 'Student') {
      return;
    }
    if (selectedAppointmentId) {
      deleteClassSession([Number(selectedAppointmentId)]);
      setDetailsModalOpen(false);
    } else {
      console.error('Error deleting Class Session.');
    }
  };

  // const calculateStartEndDates = useCallback(() => {
  //   let startDate = moment(date); // Initialize with a default value
  //   let endDate = moment(date); // Initialize with a default value

  //   if (view === Views.DAY) {
  //     startDate = moment(date).startOf('day');
  //     endDate = moment(date).endOf('day');
  //   }
  //   // } else if (view === Views.WEEK) {
  //   //   startDate = moment(date).startOf('week');
  //   //   endDate = moment(date).endOf('week');
  //   // } else if (view === Views.MONTH) {
  //   //   startDate = moment(date).startOf('month');
  //   //   endDate = moment(date).endOf('month');
  //   // }

  //   console.log('Start Date:', startDate.format('YYYY-MM-DD'));
  //   console.log('End Date:', endDate.format('YYYY-MM-DD'));

  //   // Notify parent (CalendarContent) about the new date range
  //   onDateChange(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
  // }, [view, date]);

  // useEffect(() => {
  //   calculateStartEndDates();
  // }, [date, view]);

  useEffect(() => {
    // Map classSessionEvents to FullCalendar's event structure
    const mappedEvents = classSessionEvents.map((session) => {
      // Extract and format the teacher's name to "F. LastName"
      const [firstName, lastName] = session.data.appointment.teacher.split(' ');
      const formattedTeacher = `${firstName[0]}. ${lastName}`;

      return {
        id: session.data.appointment.id,
        resourceId: session.resourceId,
        title: session.data.appointment.topic, // Using topic as the title
        start: session.start,
        end: session.end,
        extendedProps: {
          topicName: session.data.appointment.topic || 'No Topic',
          teacher: formattedTeacher, // Assigning the formatted name
          location: session.data.appointment.location,
          sessionType: session.data.appointment.sessionType,
          students: session.data.appointment.students
        }
      };
    });

    setEvents(mappedEvents);
  }, [classSessionEvents]);

  const handleOpenAddModal = (start: Date, end: Date, roomId: string) => {
    if (strongestRoles[0] == 'Student' || strongestRoles[0] == 'Parent') {
      return;
    }
    setSelectedRoom(roomId);
    setSelectedRange({ start, end });
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const resources = [
    { id: 'R1', title: 'Room 1' },
    { id: 'R2', title: 'Room 2' },
    { id: 'R3', title: 'Room 3' },
    { id: 'R4', title: 'Room 4' },
    { id: 'R5', title: 'Room 5' },
    { id: 'R6', title: 'Room 6' },
    { id: 'R7', title: 'Room 7' }
  ];

  const renderEventContent = (eventInfo) => {
    return <EventItem eventInfo={eventInfo} />;
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      width="100%"
      gap={2}
      p={2}
    >
      <FullCalendar
        plugins={[resourceTimelinePlugin, interactionPlugin]}
        schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
        initialView="resourceTimelineDay"
        initialDate={date} // Set the initial date explicitly
        headerToolbar={{
          left: '',
          center: 'prev title next',
          right: 'today'
        }}
        resources={resources}
        events={events}
        eventContent={renderEventContent}
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        resourceAreaWidth="120px"
        selectable={true}
        datesSet={(info) => {
          onDateChange(moment(info.start).format('YYYY-MM-DD'));
        }}
        eventClick={(info) => handleEventClick(info.event)}
        select={(info) => {
          handleOpenAddModal(info.start, info.end, info.resource.id);
        }}
        views={{
          resourceTimelineDay: {
            slotMinWidth: 120
          }
        }}
      />

      <EditAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        appointmentId={selectedAppointment}
        onSave={handleSaveClassSession}
        loadClassSessions={loadClassSessions}
      />

      <AddClassSessionModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleSaveClassSession}
        initialStartDate={selectedRange.start}
        initialEndDate={selectedRange.end}
        roomId={selectedRoom}
      />

      <ClassSessionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        appointmentId={selectedAppointmentId!}
        onEdit={handleEditClassSession}
        onDelete={handleDeleteClassSession}
        canEdit={canEditSession}
        canAddReport={canAddReport}
      />
    </Box>
  );
}

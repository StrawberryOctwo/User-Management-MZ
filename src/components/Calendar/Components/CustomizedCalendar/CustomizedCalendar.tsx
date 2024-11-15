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
import './index.css';
import EditAppointmentModal from '../Appointment/EditAppointmentModal';
import AddClassSessionModal from '../Appointment/AddClassSessionModal';
import ClassSessionDetailsModal from '../Modals/ClassSessionDetailsModal';
import { getStrongestRoles } from 'src/hooks/roleUtils';
import { useAuth } from 'src/hooks/useAuth';
import {
  deleteClassSession,
  toggleClassSessionActivation
} from 'src/services/classSessionService';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import EventItem from '../Appointment/EventItem';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventTypeSelectionModal from '../Modals/EventTypeSelectionModal';
import ToDoModal from '../Modals/ToDoModal';
import { useSnackbar } from 'src/contexts/SnackbarContext';

export enum TimeSlotMinutes {
  Five = 5,
  Ten = 10,
  Fifteen = 15,
  Thirty = 30
}
type Keys = keyof typeof Views;

type DemoProps = {
  classSessionEvents: any[];
  onDateChange: (date: string) => void;
  handleSaveClassSession: (newSession: any) => void;
  loadClassSessions: () => void;
  selectedLocations: any[];
};

export default function CustomizedCalendar({
  classSessionEvents,
  onDateChange,
  handleSaveClassSession,
  loadClassSessions,
  selectedLocations
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
  const [isEventTypeModalOpen, setIsEventTypeModalOpen] = useState(false);
  const [isToDoModalOpen, setIsToDoModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedRange, setSelectedRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date(),
    end: new Date()
  });

  const { showMessage } = useSnackbar();
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

  const handleDeactivateClassSession = async (
    appointmentId: string,
    isActive: boolean
  ) => {
    if (strongestRoles[0] === 'Teacher' || strongestRoles[0] === 'Student')
      return;

    try {
      await toggleClassSessionActivation([Number(appointmentId)], isActive);
      handleDeactivateComplete();
    } catch (error) {
      console.error('Error toggling class session activation:', error);
    }
  };

  const handleDeactivateComplete = () => {
    loadClassSessions();
    setSelectedAppointmentId(null);
    setDetailsModalOpen(false);
  };

  const checkOverlap = (currentSession, allSessions) => {
    const currentTeacher = currentSession.data.appointment.teacher;
    const currentStart = new Date(currentSession.start);
    const currentEnd = new Date(currentSession.end);

    return allSessions.some((otherSession) => {
      if (
        otherSession.data.appointment.id === currentSession.data.appointment.id
      )
        return false;
      const otherTeacher = otherSession.data.appointment.teacher;
      const otherStart = new Date(otherSession.start);
      const otherEnd = new Date(otherSession.end);

      return (
        currentTeacher === otherTeacher &&
        ((currentStart >= otherStart && currentStart < otherEnd) ||
          (currentEnd > otherStart && currentEnd <= otherEnd) ||
          (currentStart <= otherStart && currentEnd >= otherEnd))
      );
    });
  };

  useEffect(() => {
    const mappedEvents = classSessionEvents.map((session) => {
      const [firstName, lastName] = session.data.appointment.teacher.split(' ');
      const formattedTeacher = `${firstName[0]}. ${lastName}`;
      const hasOverlap = checkOverlap(session, classSessionEvents);

      console.log('Session:', session);

      return {
        id: session.data.appointment.id,
        resourceId: session.resourceId,
        title: session.data.appointment.topic,
        start: `${session.data.appointment.date}T${session.data.appointment.startTime}`,
        end: `${session.data.appointment.date}T${session.data.appointment.endTime}`,
        status: session.data.appointment.status,
        extendedProps: {
          topicName: session.data.appointment.topic || 'No Topic',
          teacher: formattedTeacher,
          location: session.data.appointment.location,
          sessionType: session.data.appointment.sessionType,
          students: session.data.appointment.students,
          reportStatus: session.data.appointment.reportStatus,
          hasOverlap
        }
      };
    });

    setEvents(mappedEvents);
  }, [classSessionEvents]);

  const handleOpenAddModal = (start: Date, end: Date, roomId: string) => {
    if (strongestRoles[0] == 'Student' || strongestRoles[0] == 'Parent') {
      return;
    }
    if (selectedLocations.length > 1) {
      showMessage(
        'Please select a single location to add a class session.',
        'error'
      );
      return;
    }
    setSelectedRoom(roomId);
    setSelectedRange({ start, end });
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleOpenEventTypeModal = () => {
    setIsEventTypeModalOpen(true);
  };

  const handleCloseEventTypeModal = () => {
    setIsEventTypeModalOpen(false);
  };

  const handleContinue = (eventType: string) => {
    if (eventType === 'To-Do') {
      setIsToDoModalOpen(true);
    } else if (eventType === 'Class Session') {
      if (selectedLocations.length > 1) {
        showMessage(
          'Please select a single location to add a class session.',
          'error'
        );
        return;
      }
      setIsAddModalOpen(true);
    }
  };

  const handleCloseToDoModal = () => {
    setIsToDoModalOpen(false);
  };

  const handleSaveToDo = (todo) => {
    console.log('Saving To-Do:', todo);
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

  const renderEventContent = (eventInfo: any) => {
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
        initialDate={date}
        headerToolbar={{
          left: 'today',
          center: 'prev title next',
          right: 'eventButton'
        }}
        customButtons={{
          eventButton: {
            text: 'Add Event',
            click: handleOpenEventTypeModal
          }
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

      <EventTypeSelectionModal
        isOpen={isEventTypeModalOpen}
        onClose={handleCloseEventTypeModal}
        onContinue={handleContinue}
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
        startTime={selectedRange.start}
        roomId={selectedRoom}
        passedLocations={selectedLocations}
      />

      <ToDoModal
        isOpen={isToDoModalOpen}
        onClose={handleCloseToDoModal}
        onSave={handleSaveToDo}
      />

      <ClassSessionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        appointmentId={selectedAppointmentId!}
        onEdit={handleEditClassSession}
        onDelete={handleDeleteClassSession}
        onDeactivate={handleDeactivateClassSession}
        onDeactivateComplete={handleDeactivateComplete}
        canEdit={canEditSession}
        canAddReport={canAddReport}
      />
    </Box>
  );
}

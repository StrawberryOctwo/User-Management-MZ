import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Box, ClickAwayListener, Paper, Popper } from '@mui/material';
import moment from 'moment';
import { Views } from 'react-big-calendar';
import './index.css';
import EditAppointmentModal from '../Appointment/EditClassSession/EditAppointmentModal';
import AddClassSessionModal from '../Appointment/AddClassSession/AddClassSessionModal';
import ClassSessionDetailsModal from '../Modals/ClassSessionDetailsModal';
import { getStrongestRoles } from 'src/hooks/roleUtils';
import { useAuth } from 'src/hooks/useAuth';
import {
  deleteClassSession,
  toggleClassSessionActivation,
  Holiday
} from 'src/services/classSessionService';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import EventItem from '../Appointment/EventItem/EventItem';
import interactionPlugin from '@fullcalendar/interaction';
import EventTypeSelectionModal from '../Modals/EventTypeSelectionModal';
import ToDoModal from '../Modals/ToDoModal';
import { useSnackbar } from 'src/contexts/SnackbarContext';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CalendarPicker } from '@mui/x-date-pickers/CalendarPicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import {
  calendarEventHandlers,
  calendarHelpers
} from '../../utils/calendarHelpers';
import SpecialDayModal from '../Modals/SpecialDayModal';

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
  loadClassSessions: () => void;
  selectedLocations: any[];
  holidays: Holiday[];
  closingDays: Holiday[];
  parentNumberOfRooms: Number;
};

export default function CustomizedCalendar({
  classSessionEvents,
  onDateChange,
  loadClassSessions,
  selectedLocations,
  holidays,
  closingDays,
  parentNumberOfRooms
}: DemoProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedClassSessionId, setSelectedClassSession] = useState<any>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [canEditSession, setCanEditSession] = useState<boolean | null>(true);
  const [canAddReport, setCanAddReport] = useState<boolean | null>(false);
  const [canReactivate, setCanReactivate] = useState<boolean | null>(true);
  const [events, setEvents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEventTypeModalOpen, setIsEventTypeModalOpen] = useState(false);
  const [isToDoModalOpen, setIsToDoModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedSessionDetails, setSelectedSessionDetails] =
    useState<any>(null);
  const [selectedRange, setSelectedRange] = useState<{
    start: Date;
    end: Date;
  }>({ start: new Date(), end: new Date() });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isClosingDayModalOpen, setIsClosingDayModalOpen] = useState(false);
  const [selectedSpecialDay, setSelectedSpecialDay] = useState<any>(null);
  const [sessionEnded, setIsSessionEnded] = useState<boolean | null>(false);

  const { showMessage } = useSnackbar();
  const { userRoles } = useAuth();

  const calendarRef = useRef<any>(null);
  const isHandlingClick = useRef(false);
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];
  const resources = useMemo(() => {
    const maxRooms = strongestRoles[0] === 'Parent'
      ? parentNumberOfRooms
      : selectedLocations.reduce(
        (max, location) => Math.max(max, location.numberOfRooms || 0),
        0
      );

    const unsortedResources = Array.from({ length: maxRooms }, (_, index) => ({
      id: `R${index + 1}`,
      title: `Room ${index + 1}`,
      sortOrder: index + 1
    }));

    return unsortedResources.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [selectedLocations, strongestRoles, classSessionEvents]);

  useEffect(() => {
    const mappedEvents = classSessionEvents.map((session) => {
      const [firstName, lastName] = session.data.appointment.teacher.split(' ');
      const formattedTeacher = `${firstName[0]}. ${lastName}`;
      const hasOverlap = checkOverlap(session, classSessionEvents);

      return {
        id: session.data.appointment.id,
        sessionId: session.data.appointment.sessionId,
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

  const getDateStatus = (date: Date) => {
    const dateStr = moment(date).format('YYYY-MM-DD');

    const holidayMatch = holidays?.length
      ? holidays.find((holiday) =>
        moment(dateStr).isBetween(
          holiday.start_date,
          holiday.end_date,
          'day',
          '[]'
        )
      )
      : null;

    const closingDayMatch = closingDays?.length
      ? closingDays.find((closingDay) =>
        moment(dateStr).isBetween(
          closingDay.start_date,
          closingDay.end_date,
          'day',
          '[]'
        )
      )
      : null;

    return {
      isHoliday: !!holidayMatch,
      isClosingDay: !!closingDayMatch,
      holidayName: holidayMatch?.name,
      closingDayName: closingDayMatch?.name
    };
  };

  const handleSpecialDaySuccess = () => {
    loadClassSessions();
  };

  const handleDatePickerClick = (event: MouseEvent) => {
    if (isHandlingClick.current) return;
    isHandlingClick.current = true;

    const buttonElement = document.querySelector('.fc-datePickerButton-button');

    if (buttonElement) {
      setAnchorEl(buttonElement as HTMLElement);
      setShowDatePicker(true);
    }

    setTimeout(() => {
      isHandlingClick.current = false;
    }, 100);
  };

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    if (!isHandlingClick.current) {
      setShowDatePicker(false);
      setAnchorEl(null);
    }
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    if (newValue) {
      const selected = newValue.toDate();
      setSelectedDate(selected);
      onDateChange(moment(selected).format('YYYY-MM-DD'));
      setShowDatePicker(false);
      setAnchorEl(null);

      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        calendarApi.gotoDate(selected);
      }
    }
  };

  const handleEventClick = (event: any) => {
    const eventEndDate = new Date(event.end);
    const currentDate = new Date();

    if (currentDate > eventEndDate) {
      setCanAddReport(false);
    } else if (currentDate < eventEndDate) {
      setCanAddReport(true);
      setCanEditSession(true);
    }

    if (strongestRoles[0] === 'Parent' || strongestRoles[0] === 'Student') {
      return;
    }

    if (strongestRoles[0] === 'Teacher') {
      setCanReactivate(false);
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
      setSelectedClassSession(event.extendedProps.sessionId);
      setDetailsModalOpen(true);
    } else {
      console.error('Event ID is undefined or not available.');
    }
  };

  const handleEditClassSession = (classSession: any) => {
    if (strongestRoles[0] === 'Teacher' || strongestRoles[0] === 'Student') {
      return;
    }
    if (selectedAppointmentId) {
      setSelectedAppointment(selectedAppointmentId);
      setDetailsModalOpen(false);
      setSelectedSessionDetails(classSession);
      setModalOpen(true);
    } else {
      console.error('No appointment ID selected for editing.');
    }
  };

  const handleDeleteClassSession = () => {
    if (strongestRoles[0] === 'Teacher' || strongestRoles[0] === 'Student') {
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
    if (strongestRoles[0] === 'Student') return;

    try {
      await toggleClassSessionActivation(appointmentId, isActive);
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

  const checkOverlap = (currentSession: any, allSessions: any[]) => {
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

  const handleOpenAddModal = (start: Date, end: Date, roomId: string) => {
    if (strongestRoles[0] === 'Student' || strongestRoles[0] === 'Parent') {
      return;
    }
    if (strongestRoles[0] !== 'Teacher') {
      if (selectedLocations.length > 1) {
        showMessage(
          'Please select a single location to add a class session.',
          'error'
        );
        return;
      }
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
    switch (eventType) {
      case 'To-Do':
        setIsToDoModalOpen(true);
        break;
      case 'Class Session':
        if (selectedLocations.length > 1) {
          showMessage(
            'Please select a single location to add a class session.',
            'error'
          );
          return;
        }
        setIsAddModalOpen(true);
        break;
      case 'Holiday':
        setIsHolidayModalOpen(true);
        break;
      case 'Closing Day':
        setIsClosingDayModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleCloseToDoModal = () => {
    setIsToDoModalOpen(false);
  };

  const handleSaveToDo = (todo: any) => {
    console.log('Saving To-Do:', todo);
  };

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
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ClickAwayListener
          onClickAway={handleClickAway}
          mouseEvent="onMouseDown"
        >
          <div>
            <Popper
              open={showDatePicker}
              anchorEl={anchorEl}
              placement="bottom-start"
              style={{ zIndex: 1300 }}
            >
              <Paper elevation={3} style={{ padding: '16px' }}>
                <CalendarPicker
                  date={dayjs(selectedDate)}
                  onChange={handleDateChange}
                />
              </Paper>
            </Popper>
          </div>
        </ClickAwayListener>
      </LocalizationProvider>

      <FullCalendar
        ref={calendarRef}
        plugins={[resourceTimelinePlugin, interactionPlugin]}
        schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
        initialView="resourceTimelineDay"
        initialDate={selectedDate}
        headerToolbar={calendarHelpers.getHeaderToolbar()}
        customButtons={calendarHelpers.getCustomButtons(
          handleDatePickerClick,
          handleOpenEventTypeModal,
          selectedDate
        )}
        resources={resources}
        resourceOrder="sortOrder"
        events={events}
        eventContent={renderEventContent}
        slotMinTime="12:00:00"
        slotMaxTime="19:00:00"
        resourceAreaWidth="120px"
        selectable={true}
        slotLabelFormat={calendarHelpers.getTimeFormats().slotLabelFormat}
        titleFormat={calendarHelpers.getTimeFormats().titleFormat}
        datesSet={(info) => {
          const currentDate = info.view.currentStart;
          setSelectedDate(currentDate);
          onDateChange(moment(currentDate).format('YYYY-MM-DD'));
        }}
        eventClick={(info) => handleEventClick(info.event)}
        select={(info) =>
          calendarEventHandlers.handleSelect(
            info,
            getDateStatus,
            showMessage,
            handleOpenAddModal
          )
        }
        views={calendarHelpers.getViewSettings()}
        slotLabelDidMount={(arg) =>
          calendarEventHandlers.handleSlotLabel(arg, getDateStatus)
        }
        selectConstraint={calendarHelpers.getSelectConstraint()}
        selectOverlap={(event) =>
          calendarEventHandlers.handleSelectOverlap(event, getDateStatus)
        }
      />

      <EventTypeSelectionModal
        isOpen={isEventTypeModalOpen}
        onClose={handleCloseEventTypeModal}
        onContinue={handleContinue}
        userRole={strongestRoles[0]}
      />

      <EditAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        appointmentId={selectedAppointment}
        classSessionId={selectedClassSessionId}
        sessionDetails={selectedSessionDetails}
        sessionEnded={sessionEnded}
      />

      <AddClassSessionModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
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
        canReactivate={canReactivate}
        sessionEnded={sessionEnded}
        setIsSessionEnded={setIsSessionEnded}
      />

      <SpecialDayModal
        isOpen={isHolidayModalOpen}
        onClose={() => {
          setIsHolidayModalOpen(false);
          setSelectedSpecialDay(null);
        }}
        type="Holiday"
        initialData={selectedSpecialDay}
        onSuccess={handleSpecialDaySuccess}
      />

      <SpecialDayModal
        isOpen={isClosingDayModalOpen}
        onClose={() => {
          setIsClosingDayModalOpen(false);
          setSelectedSpecialDay(null);
        }}
        type="Closing Day"
        initialData={selectedSpecialDay}
        onSuccess={handleSpecialDaySuccess}
      />
    </Box>
  );
}

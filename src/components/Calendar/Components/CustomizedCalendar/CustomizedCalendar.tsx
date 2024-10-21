import React, { useState, useCallback, useMemo, cloneElement, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Slider,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import moment from "moment";
import { EventProps, Views } from "react-big-calendar";
import Calendar from "../Calendar";

import "react-datepicker/dist/react-datepicker.css";
import "./index.css"; // Your custom styles
import AppointmentEvent from "./AppointmentEvent"; // Custom Appointment Event component
import BlockoutEvent from "./BlockoutEvent"; // Custom Blockout Event component
import { EventItem } from "../../types";
import ToolbarControls from "./ToolbarControls";
import EditAppointmentModal from "../Appointment/EditAppointmentModal"; // Import the Edit Appointment Modal
import AddClassSessionModal from "../Appointment/AddClassSessionModal";
import ClassSessionDetailsModal from "../Modals/ClassSessionDetailsModal";
import { getStrongestRoles } from 'src/hooks/roleUtils';
import { useAuth } from "src/hooks/useAuth";

export enum TimeSlotMinutes {
  Five = 5,
  Ten = 10,
  Fifteen = 15,
  Thirty = 30,
}

const timeSlotLinesMap = {
  [TimeSlotMinutes.Five]: {
    '.rbc-time-slot:nth-child(6n + 4):after': {
      width: '25% !important',
    },
    '.rbc-time-slot:nth-child(3n + 2):after': {
      width: '12.5% !important',
    },
    '.rbc-time-slot:nth-child(3n + 3):after': {
      width: '12.5% !important',
    },
  },
  [TimeSlotMinutes.Ten]: {
    '.rbc-time-slot:nth-child(3n + 2):after': {
      width: '12.5% !important',
    },
    '.rbc-time-slot:nth-child(3n + 3):after': {
      width: '12.5% !important',
    },
  },
  [TimeSlotMinutes.Fifteen]: {
    '.rbc-time-slot:nth-child(2n):after': {
      width: '25% !important',
    },
  },
  [TimeSlotMinutes.Thirty]: {},
};


type Keys = keyof typeof Views;


type DemoProps = {
  classSessionEvents: EventItem[]; // Accept classSessionEvents as a prop
  onDateChange: (startDate: string, endDate: string) => void; // New prop to pass the date change handler
  handleSaveClassSession: (newSession: any) => void; // Accept as a prop
  loadClassSessions: () => void; // Add this prop
};

export default function CustomizedCalendar({
  classSessionEvents,
  onDateChange,
  handleSaveClassSession,
  loadClassSessions,
}: DemoProps) {
  const [date, setDate] = useState<Date>(moment().toDate());
  const [view, setView] = useState<(typeof Views)[Keys]>(Views.WEEK);
  const [contextMenuInfo, setContextMenuInfo] = useState<{
    xPosition: number;
    yPosition: number;
    selectedTime: string;
    resourceId: number;
  }>();

  // State for managing selected event and modal visibility
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const { userRoles } = useAuth();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];

  const onPrevClick = useCallback(() => {
    if (view === Views.DAY) {
      setDate(moment(date).subtract(1, "d").toDate());
    } else if (view === Views.WEEK) {
      setDate(moment(date).subtract(1, "w").toDate());
    } else {
      setDate(moment(date).subtract(1, "M").toDate());
    }
  }, [view, date]);

  const onNextClick = useCallback(() => {
    if (view === Views.DAY) {
      setDate(moment(date).add(1, "d").toDate());
    } else if (view === Views.WEEK) {
      setDate(moment(date).add(1, "w").toDate());
    } else {
      setDate(moment(date).add(1, "M").toDate());
    }
  }, [view, date]);

  const [zoom, setZoom] = useState<number>(4); // Now it's a single number, not an array

  const dateText = useMemo(() => {
    if (view === Views.DAY) return moment(date).format("dddd, MMMM DD");
    if (view === Views.WEEK) {
      const from = moment(date)?.startOf("week");
      const to = moment(date)?.endOf("week");
      return `${from.format("MMMM DD")} to ${to.format("MMMM DD")}`;
    }
  }, [view, date]);

  const components: any = {
    event: ({ event }: EventProps<any>) => {
      const data = event?.data;
      if (data?.appointment) {
        return <AppointmentEvent appointment={data?.appointment} />;
      }
      if (data?.blockout) {
        return <BlockoutEvent blockout={data?.blockout} />;
      }
      return null;
    },
    timeSlotWrapper: ({
      children,
      value,
      resource,
    }: {
      children: JSX.Element;
      value: string;
      resource: number;
    }) => {
      return cloneElement(children, {
        onContextMenu: (e: MouseEvent) => {
          e.preventDefault();
          setContextMenuInfo({
            xPosition: e.clientX,
            yPosition: e.clientY,
            selectedTime: value,
            resourceId: resource,
          });
        },
      });
    },
  };

  const onTodayClick = useCallback(() => {
    setDate(moment().toDate());
  }, []);

  const STEP = 15;
  const TIME_SLOTS = 60 / STEP;

  // Function to handle event selection
  const handleEventClick = (event: any) => {
    const appointmentId = event.data?.appointment?.id;
    if (appointmentId) {
      setSelectedAppointmentId(appointmentId);
      setDetailsModalOpen(true);
    } else {
      console.error("Event ID is undefined or not available.");
    }
  };

  const handleEditClassSession = () => {
    if (selectedAppointmentId) {
      setSelectedAppointment(selectedAppointmentId);
      setDetailsModalOpen(false);
      setModalOpen(true);
    } else {
      console.error("No appointment ID selected for editing.");
    }
  };

  const calculateStartEndDates = useCallback(() => {
    let startDate = moment(); // Initialize with a default value
    let endDate = moment(); // Initialize with a default value

    if (view === Views.DAY) {
      startDate = moment(date).startOf("day");
      endDate = moment(date).endOf("day");
    } else if (view === Views.WEEK) {
      startDate = moment(date).startOf("week");
      endDate = moment(date).endOf("week");
    } else if (view === Views.MONTH) {
      startDate = moment(date).startOf("month");
      endDate = moment(date).endOf("month");
    }

    // Notify parent (CalendarContent) about the new date range
    onDateChange(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"));
  }, [view, date, onDateChange]);

  useEffect(() => {
    calculateStartEndDates();
  }, [date, view, calculateStartEndDates]);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });

  const handleOpenAddModal = (start: Date, end: Date) => {
    if (strongestRoles[0] == 'Teacher' || strongestRoles[0] == 'Student') {
      return
    }
    setSelectedRange({ start, end });
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  return (
    <Box display="flex" flexDirection="column" height="100%" width="100%" gap={2} p={2}>
      <ToolbarControls
        date={date}
        zoom={zoom}
        setZoom={setZoom}
        setDate={setDate}
        onTodayClick={onTodayClick}
        onPrevClick={onPrevClick}
        onNextClick={onNextClick}
        setView={setView}
        view={view}
        dateText={dateText}
      />
      <Box
        flex={1}
        width="100%"
        overflow="auto"
        position="relative"
        onClick={() => setContextMenuInfo(undefined)}
        sx={{
          '.rbc-timeslot-group': {
            minHeight: `${zoom * 24}px !important`,
          },
          ...timeSlotLinesMap[STEP as TimeSlotMinutes],
        }}
      >
        <Calendar
          events={classSessionEvents}
          defaultDate={moment().toDate()}
          defaultView={Views.WEEK}
          min={moment().set({ hour: 9, minute: 0 }).toDate()}
          max={moment().set({ hour: 22, minute: 0 }).toDate()}
          components={components}
          toolbar={false}
          date={date}
          view={view}
          onView={setView}
          onNavigate={setDate}
          onSelectEvent={handleEventClick}
          step={STEP}
          timeslots={TIME_SLOTS}
          selectable
          onSelectSlot={(slotInfo) => {
            handleOpenAddModal(slotInfo.start, slotInfo.end);
          }}
          formats={{
            timeGutterFormat: "HH:mm",
            eventTimeRangeFormat: ({ start, end }) =>
              `${moment(start).format("HH:mm")} - ${moment(end).format("HH:mm")}`,
          }}
        />
      </Box>

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
      />

      <ClassSessionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        appointmentId={selectedAppointmentId!}
        onEdit={handleEditClassSession}
      />
    </Box>
  );
}

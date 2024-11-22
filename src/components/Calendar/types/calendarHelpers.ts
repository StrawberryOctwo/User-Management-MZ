import { Views } from 'react-big-calendar';
import { FormatterInput } from '@fullcalendar/core';

export type Keys = keyof typeof Views;

export interface Holiday {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  locationId: number;
}

export interface HolidayResponse {
  message: string;
  holidays: Holiday[];
  meta: {
    locationsRequested: number;
    holidaysFound: number;
  };
}

export interface SpecialDayData {
  id?: number;
  name: string;
  start_date: string;
  end_date: string;
  locationId: number;
}

export interface CalendarHelpers {
  getHeaderToolbar: () => {
    left: string;
    center: string;
    right: string;
  };
  getCustomButtons: (
    handleDatePickerClick: (event: MouseEvent) => void,
    handleOpenEventTypeModal: () => void,
    selectedDate: Date
  ) => {
    datePickerButton: {
      text: string;
      click: (e: MouseEvent) => void;
    };
    eventButton: {
      text: string;
      click: () => void;
    };
  };
  getTimeFormats: () => {
    slotLabelFormat: FormatterInput;
    titleFormat: FormatterInput;
  };
  getViewSettings: () => {
    resourceTimelineDay: {
      slotMinWidth: number;
    };
  };
  getSelectConstraint: () => {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
  };
}

export interface CalendarEventHandlers {
  handleSlotLabel: (arg: any, getDateStatus: (date: Date) => any) => void;
  handleSelect: (
    info: any,
    getDateStatus: (date: Date) => any,
    showMessage: any,
    handleOpenAddModal: any
  ) => void;
  handleSelectOverlap: (
    event: any,
    getDateStatus: (date: Date) => any
  ) => boolean;
}

export interface DemoProps {
  classSessionEvents: any[];
  onDateChange: (date: string) => void;
  loadClassSessions: () => void;
  selectedLocations: any[];
}

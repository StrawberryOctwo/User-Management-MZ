import moment from 'moment';
import {
  CalendarEventHandlers,
  CalendarHelpers
} from '../types/calendarHelpers';
import { FormatterInput } from '@fullcalendar/core';

export const calendarHelpers: CalendarHelpers = {
  getHeaderToolbar: () => ({
    left: 'today',
    center: 'prev datePickerButton next',
    right: 'eventButton'
  }),

  getCustomButtons: (
    handleDatePickerClick,
    handleOpenEventTypeModal,
    selectedDate
  ) => ({
    datePickerButton: {
      text: moment(selectedDate).format('dddd, MMMM D, YYYY'),
      click: (e: MouseEvent) => handleDatePickerClick(e)
    },
    eventButton: {
      text: 'Add Event',
      click: handleOpenEventTypeModal
    }
  }),

  getTimeFormats: () => ({
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    } as FormatterInput,
    titleFormat: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    } as FormatterInput
  }),

  getViewSettings: () => ({
    resourceTimelineDay: {
      slotMinWidth: 120
    }
  }),

  getSelectConstraint: () => ({
    startTime: '12:00:00',
    endTime: '19:00:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
  })
};

export const calendarEventHandlers: CalendarEventHandlers = {
  handleSlotLabel: (arg, getDateStatus) => {
    const { isHoliday, isClosingDay } = getDateStatus(arg.date);

    if (isClosingDay) {
      arg.el.classList.add('closing-day');
      arg.el.style.pointerEvents = 'none';
    }
    if (isHoliday) {
      arg.el.classList.add('holiday');
    }
  },

  handleSelect: (info, getDateStatus, showMessage, handleOpenAddModal) => {
    const { isClosingDay } = getDateStatus(info.start);
    if (isClosingDay) {
      showMessage('Cannot add events on closing days', 'error');
      return;
    }
    handleOpenAddModal(info.start, info.end, info.resource.id);
  },

  handleSelectOverlap: (event, getDateStatus) => {
    if (!event.start) return true;
    const { isClosingDay } = getDateStatus(new Date(event.start));
    return !isClosingDay;
  }
};

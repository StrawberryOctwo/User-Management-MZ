// src/services/CalendarsharedService.ts

import { EventEmitter } from 'events';

class CalendarSharedService extends EventEmitter {
  private static instance: CalendarSharedService;

  private constructor() {
    super();
  }

  static getInstance() {
    if (!CalendarSharedService.instance) {
      CalendarSharedService.instance = new CalendarSharedService();
    }
    return CalendarSharedService.instance;
  }
}

export const calendarsharedService = CalendarSharedService.getInstance();

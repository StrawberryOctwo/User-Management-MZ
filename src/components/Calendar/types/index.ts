export type Appointment = {
  id: number;
  status: string;
  location: string;
  topic: string;
  resource: string;
  address: string;
  className: string; // Class session name
  teacher: string; // Teacher name
  studentCount: number; // Number of students
  startTime: string; // Formatted session date
  endTime: string; // Formatted session date
  sessionType: string
};

export type Blockout = { id: number; name: string };

export type EventItem = {
  start?: Date;
  end?: Date;
  data?: { appointment?: Appointment; blockout?: Blockout };
  isDraggable?: boolean;
  resourceId?: number;
  numberOfRooms?: number;
};

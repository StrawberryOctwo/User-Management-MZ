export interface Session {
  day: string;
  startTime: string;
  duration: number;
}

export interface ClassSession {
  name: string;
  startDate: Date;
  endDate: Date;
  sessions: Session[];
  note: string;
  sessionType: string;
  isHolidayCourse: boolean;
  teacherId: any;
  topicId: any;
  locationId: any;
  studentIds: number[];
}

export const allowedDurations = [45, 60, 90, 120];

export const recurrenceOptions = [
  { value: 'once', label: 'Once' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' }
];

export const daysOfWeek = [
  { value: 'MO', label: 'Monday' },
  { value: 'TU', label: 'Tuesday' },
  { value: 'WE', label: 'Wednesday' },
  { value: 'TH', label: 'Thursday' },
  { value: 'FR', label: 'Friday' },
  { value: 'SA', label: 'Saturday' },
  { value: 'SU', label: 'Sunday' }
];

export const validateStudentSelection = (
  sessionType: string,
  students: any[]
) => {
  if (sessionType === '1on1' && students.length !== 1) {
    return {
      validatedStudents: students.slice(0, 1),
      error: 'You must select exactly one student for a 1-on-1 session.'
    };
  }
  return { validatedStudents: students, error: null };
};

export const validateTime = (
  date: Date | null,
  type: 'start' | 'end',
  setStartTimeError: (error: string | null) => void,
  t: (key: string) => string
): boolean => {
  if (date) {
    const hour = date.getHours();
    if (hour < 9 || hour > 20) {
      if (type === 'start') {
        setStartTimeError(t('errors.invalidStartTime'));
      }
      return false;
    } else {
      setStartTimeError(null);
      return true;
    }
  }
  return false;
};

export const getDayLabel = (dayValue: string) => {
  const day = daysOfWeek.find((d) => d.value === dayValue);
  return day ? day.label : dayValue;
};

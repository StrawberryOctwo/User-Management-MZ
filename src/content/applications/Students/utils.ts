export const daysOfWeek = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' }
];
export function encodeAvailableDates(days: string[]): string {
  const daysOfWeek = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ];
  return daysOfWeek.map((day) => (days.includes(day) ? '1' : '0')).join('');
}

export const decodeAvailableDates = (encoded: string): string[] => {
  const daysOfWeek = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ];
  return encoded
    .split('')
    .map((char, index) => (char === '1' ? daysOfWeek[index] : null))
    .filter((day) => day !== null);
};

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

// utils.ts
// utils.ts
export const decodeAvailableTimes = (availableTimesData: any): { start: string; end: string } => {
  // Assuming availableTimesData is an object like { start: '09:00', end: '12:00' }
  if (!availableTimesData) {
    return { start: '', end: '' };
  }
  return {
    start: availableTimesData.start || '',
    end: availableTimesData.end || '',
  };
};

export const encodeAvailableTimes = (availableTime: { start: string; end: string }): any => {
  // Prepare the data structure expected by the backend
  return {
    start: availableTime.start,
    end: availableTime.end,
  };
};

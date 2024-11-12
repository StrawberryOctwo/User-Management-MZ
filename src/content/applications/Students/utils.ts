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

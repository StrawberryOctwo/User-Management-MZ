import moment from 'moment';
import dayjs from 'dayjs';
import 'dayjs/locale/de'; 
dayjs.locale('de');

export const processAvailabilities = (availabilities) => {
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return availabilities
      // Filter out entries where both startTime and endTime are "00:00:00"
      .filter(({ startTime, endTime }) => !(startTime === '00:00:00' && endTime === '00:00:00'))
      // Map updatedAt to German date format
      .map(item => ({
          ...item,
          updatedAt: dayjs(item.updatedAt).format('DD.MM.YYYY HH:mm'),
      }))
      // Sort by day of the week
      .sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));
};
export const generateEmployeeNumber = (firstName: string, lastName: string, dob: string): string => {
  // Extract initials
  const initials = `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;

  // Extract formatted DOB (e.g., YYYYMMDD)
  const formattedDob = moment(dob).format('YYYYMMDD');

  // Add some random component (e.g., random number + random letters)
  const randomComponent = Math.random().toString(36).substring(2, 6).toUpperCase();

  // Create a hash-like component based on name and DOB
  const hashComponent = (initials + formattedDob).split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  // Combine all parts
  const employeeNumber = `${initials}${formattedDob}${randomComponent}${hashComponent % 1000}`;

  // Return the unique employee number
  return employeeNumber;
};
export function calculateEndTimeInMinutes(startTime: string, durationMinutes: number): string {
  // Split the startTime into hours and minutes
  const [hours, minutes] = startTime.split(":").map(Number);

  // Create a Date object for the start time
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0); // Set the time to hours and minutes

  // Add the duration in minutes
  startDate.setMinutes(startDate.getMinutes() + durationMinutes);

  // Format the end time as HH:mm
  const endTime = startDate.toTimeString().slice(0, 5); // Extract HH:mm from the time string
  return endTime;
}

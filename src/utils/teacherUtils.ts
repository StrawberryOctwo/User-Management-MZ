import moment from 'moment';

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

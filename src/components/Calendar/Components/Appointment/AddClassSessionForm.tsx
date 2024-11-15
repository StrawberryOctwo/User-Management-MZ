import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import FormFields from './FormFields';

interface AddClassSessionFormProps {
  isOpen: boolean;
  handleClose: () => void;
  handleSave: () => void;
  newSession: any;
  setNewSession: React.Dispatch<any>;
  selectedTeacher: any;
  setSelectedTeacher: React.Dispatch<any>;
  selectedStudents: any[];
  setSelectedStudents: React.Dispatch<any[]>;
  selectedLocation: any;
  setSelectedLocation: React.Dispatch<any>;
  selectedTopic: any;
  setSelectedTopic: React.Dispatch<any>;
  strongestRoles: string[];
  userId: number;
  fetchTeacherByUserId: (userId: number) => Promise<any>;
  fetchTeachers: (page: number, limit: number, query?: string) => Promise<any>;
  fetchStudents: (page: number, limit: number, query?: string) => Promise<any>;
  fetchLocations: (page: number, limit: number, query?: string) => Promise<any>;
  fetchTopics: (page: number, limit: number, query?: string) => Promise<any>;
  sessionTypes: any[];
  recurrencePatternOption: string; // Added
  setRecurrencePatternOption: React.Dispatch<React.SetStateAction<string>>; // Added
  resetDayDetails: () => void; // Added
  dayDetails: { [key: string]: { startTime: string; duration: number } }; // Added
  handleDayDetailChange: (day: string, field: string, value: any) => void; // Added
  handleDayToggle: (
    event: React.MouseEvent<HTMLElement>,
    newDays: string[]
  ) => void; // Added
  fieldErrors: { [key: string]: string | null };
}

const AddClassSessionForm: React.FC<AddClassSessionFormProps> = ({
  isOpen,
  handleClose,
  handleSave,
  newSession,
  setNewSession,
  selectedTeacher,
  setSelectedTeacher,
  selectedStudents,
  setSelectedStudents,
  selectedLocation,
  setSelectedLocation,
  selectedTopic,
  setSelectedTopic,
  strongestRoles,
  userId,
  fetchTeacherByUserId,
  fetchTeachers,
  fetchStudents,
  fetchLocations,
  fetchTopics,
  sessionTypes,
  recurrencePatternOption,
  setRecurrencePatternOption,
  resetDayDetails,
  dayDetails,
  handleDayDetailChange,
  handleDayToggle,
  fieldErrors
}) => {
  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Add Class Session</DialogTitle>
      <DialogContent
        sx={{
          paddingBottom: 0
        }}
      >
        <FormFields
          newSession={newSession}
          setNewSession={setNewSession}
          selectedTeacher={selectedTeacher}
          setSelectedTeacher={setSelectedTeacher}
          selectedStudents={selectedStudents}
          setSelectedStudents={setSelectedStudents}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
          strongestRoles={strongestRoles}
          userId={userId}
          fetchTeacherByUserId={fetchTeacherByUserId}
          fetchTeachers={fetchTeachers}
          fetchStudents={fetchStudents}
          fetchLocations={fetchLocations}
          fetchTopics={fetchTopics}
          sessionTypes={sessionTypes}
          recurrencePatternOption={recurrencePatternOption}
          setRecurrencePatternOption={setRecurrencePatternOption}
          resetDayDetails={resetDayDetails}
          dayDetails={dayDetails}
          handleDayDetailChange={handleDayDetailChange}
          handleDayToggle={handleDayToggle}
          fieldErrors={fieldErrors}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddClassSessionForm;

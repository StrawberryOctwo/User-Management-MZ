import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import FormFields from '../FormComponents/FormFields';
import { useAuth } from 'src/hooks/useAuth';
import { useSession } from '../../SessionContext';
import { getStrongestRoles } from 'src/hooks/roleUtils';
import {
  fetchClassSessionById,
  updateClassSession
} from 'src/services/classSessionService';

interface EditClassSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string | number;
  passedLocations?: any[];
  startTime?: Date;
  appointmentId?: string;
}

const EditClassSessionModal: React.FC<EditClassSessionModalProps> = ({
  isOpen,
  onClose,
  roomId,
  passedLocations = [],
  startTime,
  appointmentId
}) => {
  const [editSession, setEditSession] = useState({});
  const { userId, userRoles } = useAuth();
  const { session, clearSession } = useSession();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];
  const [disabled, setDisabled] = useState(false);

  const onSave = () => {
    // Ensure dayDetails is correctly populated
    if (!session.dayDetails || Object.keys(session.dayDetails).length === 0) {
      console.error('dayDetails is empty or not defined:', session.dayDetails);
      return;
    }

    // Map dayDetails to sessions
    const updatedSessions = Object.keys(session.dayDetails).map((day) => ({
      day,
      startTime: session.dayDetails[day].startTime,
      duration: session.dayDetails[day].duration
    }));

    // Create a new object with the session and sessions array
    const newSessionObject = {
      ...session,
      sessions: updatedSessions
    };

    // Call addClassSession with the new session object
    updateClassSession(appointmentId, newSessionObject);

    // Clear the form
    clearSession();
    onClose();
  };

  const handleClose = () => {
    clearSession();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Edit Class Session</DialogTitle>
      <DialogContent
        sx={{
          paddingBottom: 0
        }}
      >
        <FormFields
          strongestRoles={strongestRoles}
          userId={userId}
          roomId={roomId}
          editSession={editSession}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={onSave}
          color="primary"
          variant="contained"
          disabled={disabled}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditClassSessionModal;

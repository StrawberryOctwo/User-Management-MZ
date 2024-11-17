import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Tab,
  Tabs
} from '@mui/material';
import FormFields from '../FormComponents/FormFields';
import { useAuth } from 'src/hooks/useAuth';
import { getStrongestRoles } from 'src/hooks/roleUtils';
import {
  updateClassSession,
  updateSessionInstance
} from 'src/services/classSessionService';
import EditSessionInstanceTab from './EditSessionInstanceTab';
import { useSession } from '../../SessionContext';

interface EditClassSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string | number;
  passedLocations?: any[];
  startTime?: Date;
  appointmentId?: string;
  sessionDetails?: any;
}

const EditClassSessionModal: React.FC<EditClassSessionModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  sessionDetails
}) => {
  const [editInstance, setEditInstance] = useState({});
  const { userId, userRoles } = useAuth();
  const { session, clearSession } = useSession();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];
  const [disabled, setDisabled] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const onSave = () => {
    const updatedSessions = Object.keys(session.dayDetails).map((day) => ({
      day,
      startTime: session.dayDetails[day].startTime,
      duration: session.dayDetails[day].duration
    }));

    const newSessionObject = {
      ...session,
      sessions: updatedSessions
    };

    if (tabIndex === 0) {
      updateSessionInstance(appointmentId, editInstance);
    } else if (tabIndex === 1) {
      updateClassSession(appointmentId, newSessionObject);
    }

    onClose();
  };

  const handleClose = () => {
    clearSession();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        aria-label="edit tabs"
        sx={{
          mt: 2,
          ml: 4
        }}
      >
        <Tab label="Edit Current Session" />
        <Tab label="Edit Class (All Sessions)" />
      </Tabs>
      <DialogContent
        sx={{
          paddingBottom: 0
        }}
      >
        {tabIndex === 0 && (
          <EditSessionInstanceTab
            session={editInstance}
            setSession={setEditInstance}
          />
        )}
        {tabIndex === 1 && (
          <FormFields
            strongestRoles={strongestRoles}
            userId={userId}
            editSession={sessionDetails}
          />
        )}
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

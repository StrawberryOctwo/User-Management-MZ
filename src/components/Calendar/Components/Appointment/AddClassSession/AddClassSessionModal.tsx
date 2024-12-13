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
import { getStrongestRoles } from 'src/hooks/roleUtils';
import { addClassSession } from 'src/services/classSessionService';
import { Session, useSession } from '../../SessionContext';
import ConfirmationDialog from '../../Modals/ConfirmationDialog';
import { t } from "i18next"

interface AddClassSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string | number;
  passedLocations?: any[];
  startTime?: Date;
}

const AddClassSessionModal: React.FC<AddClassSessionModalProps> = ({
  isOpen,
  onClose,
  roomId,
  passedLocations = [],
  startTime
}) => {
  const { userId, userRoles } = useAuth();
  const { session, setSession, clearSession } = useSession();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];
  const [disabled, setDisabled] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const validateSession = (session: Session) => {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6); // Calculate the date 6 months ago

    if (!session.room) return false;

    if (
      !session.startDate ||
      !(session.startDate instanceof Date) ||
      session.startDate < sixMonthsAgo // Check if the start date is not earlier than 6 months ago
    )
      return false;

    if (!session.endDate || !(session.endDate instanceof Date)) return false;
    if (!session.sessionType) return false;
    if (typeof session.isHolidayCourse !== 'boolean') return false;
    if (!session.teacherId) return false;
    if (!session.topicId) return false;
    if (!session.locationId) return false;
    if (!Array.isArray(session.studentIds) || session.studentIds.length === 0)
      return false;
    if (!session.dayDetails || Object.keys(session.dayDetails).length === 0)
      return false;
    if (!session.recurrenceOption) return false;

    return true;
  };


  useEffect(() => {
    setDisabled(!validateSession(session));
  }, [session]);

  const onSave = () => {
    if (!validateSession(session)) {
      console.error('Validation failed:', session);
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
    addClassSession(newSessionObject);

    // Clear the form
    clearSession();
    onClose();
  };

  const handleClose = () => {
    clearSession();
    onClose();
  };

  const handleOpenConfirm = () => {
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  const handleConfirmSave = () => {
    onSave();
    handleCloseConfirm();
  };

  return (
    <>
      <Dialog open={isOpen} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>t{("add_class_session")}</DialogTitle>
        <DialogContent
          sx={{
            paddingBottom: 0
          }}
        >
          <FormFields
            strongestRoles={strongestRoles}
            userId={userId}
            roomId={roomId}
            passedLocations={passedLocations}
            isPartial={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            {t("cancel")}
          </Button>
          <Button
            onClick={handleOpenConfirm}
            color="primary"
            variant="contained"
            disabled={disabled}
          >
            {t("save")}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmSave}
        title={t("confirm_save")}
        content="Please review all details carefully before saving. Are you sure you want to save?"
        confirmButtonText={t("save")}
      />
    </>
  );
};

export default AddClassSessionModal;

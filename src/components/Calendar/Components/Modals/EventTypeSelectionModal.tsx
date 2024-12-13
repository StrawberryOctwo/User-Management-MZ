import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography
} from '@mui/material';
import RoleBasedComponent from 'src/components/ProtectedComponent';
import { t } from "i18next"

type EventTypeSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (eventType: string) => void;
  userRole?: string;
};

export default function EventTypeSelectionModal({
  isOpen,
  onClose,
  onContinue,
  userRole = 'SuperAdmin'
}: EventTypeSelectionModalProps) {
  const [selectedEventType, setSelectedEventType] =
    React.useState('Class Session');

  const handleEventTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedEventType(event.target.value);
  };

  const handleContinue = () => {
    onContinue(selectedEventType);
    onClose();
  };


  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: { padding: '20px' }
      }}
    >
      <DialogTitle>{t("what are you adding?")}</DialogTitle>
      <DialogContent>
        <Box padding={2}>
          <RadioGroup
            value={selectedEventType}
            onChange={handleEventTypeChange}
          >
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {t("regular_events")}
            </Typography>
            <FormControlLabel
              value="Class Session"
              control={<Radio />}
              label={t("class_session")}
            />
            {/* <FormControlLabel value="To-Do" control={<Radio />} label="To-Do" /> */}


            <RoleBasedComponent allowedRoles={['SuperAdmin', 'FranchiseAdmin']}>
              <>
                <Box mt={2}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    {t("administrative_options")}
                  </Typography>
                </Box>
                <FormControlLabel
                  value="Holiday"
                  control={<Radio />}
                  label={t("holiday")}
                />
                <FormControlLabel
                  value="Closing Day"
                  control={<Radio />}
                  label={t("closing_day")}
                />
              </>
            </RoleBasedComponent>
          </RadioGroup>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("cancel")}</Button>
        <Button onClick={handleContinue} variant="contained" color="primary">
          {t("continue")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

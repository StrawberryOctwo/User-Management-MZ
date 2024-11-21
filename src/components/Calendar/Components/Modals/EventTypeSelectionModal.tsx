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

  const showAdminOptions = userRole === 'SuperAdmin';

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
      <DialogTitle>What are you adding?</DialogTitle>
      <DialogContent>
        <Box padding={2}>
          <RadioGroup
            value={selectedEventType}
            onChange={handleEventTypeChange}
          >
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Regular Events
            </Typography>
            <FormControlLabel
              value="Class Session"
              control={<Radio />}
              label="Class Session"
            />
            <FormControlLabel value="To-Do" control={<Radio />} label="To-Do" />

            {showAdminOptions && (
              <>
                <Box mt={2}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Administrative Options
                  </Typography>
                </Box>
                <FormControlLabel
                  value="Holiday"
                  control={<Radio />}
                  label="Holiday"
                />
                <FormControlLabel
                  value="Closing Day"
                  control={<Radio />}
                  label="Closing Day"
                />
              </>
            )}
          </RadioGroup>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleContinue} variant="contained" color="primary">
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}

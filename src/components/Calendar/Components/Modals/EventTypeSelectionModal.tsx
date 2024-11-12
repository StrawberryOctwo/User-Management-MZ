import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, RadioGroup, FormControlLabel, Radio, Box } from '@mui/material';

type EventTypeSelectionModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onContinue: (eventType: string) => void;
};

export default function EventTypeSelectionModal({
    isOpen,
    onClose,
    onContinue
}: EventTypeSelectionModalProps) {
    const [selectedEventType, setSelectedEventType] = React.useState('Class Session');

    const handleEventTypeChange = (event) => {
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
            <DialogTitle>What are you adding?</DialogTitle>
            <DialogContent>
                <Box padding={2}>
                    <RadioGroup value={selectedEventType} onChange={handleEventTypeChange}>
                        <FormControlLabel value="Class Session" control={<Radio />} label="Class Session" />
                        <FormControlLabel value="To-Do" control={<Radio />} label="To-Do" />
                    </RadioGroup>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleContinue} variant="contained" color="primary">Continue</Button>
            </DialogActions>
        </Dialog>
    );
}

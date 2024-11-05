import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Typography, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { getAbsenceDetails, createOrUpdateAbsences } from 'src/services/absence';
import { calendarsharedService } from '../../CalendarSharedService';

interface AbsenceTabProps {
  classSessionId: string;
  isOpen: boolean;
  student: any;
  onClose: () => void;
}

const AbsenceTab: React.FC<AbsenceTabProps> = ({ classSessionId, isOpen, student, onClose }) => {
  const [reason, setReason] = useState<string>('');
  const [proof, setProof] = useState<string>('');
  const [status, setStatus] = useState<boolean>(false); // Default to "Absent" (true)
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [absenceId, setAbsenceId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && student) {
      setLoading(true);
      getAbsenceDetails(student.id, classSessionId)
        .then((data) => {
          if (data && typeof data === 'object') {
            setReason(data.absences[0].reason || '');
            setProof(data.absences[0].proof || '');
            setStatus(data.absences[0].status ?? true);
            setAbsenceId(data.absences[0].absenceId);
            setIsEditMode(true);
          } else {
            setReason('');
            setProof('');
            setStatus(true);
            setAbsenceId(null);
            setIsEditMode(false);
          }
        })
        .catch((error) => console.error('Failed to fetch absence details:', error))
        .finally(() => setLoading(false));
    } else if (!isOpen) {
      setReason('');
      setProof('');
      setStatus(true);
      setAbsenceId(null);
      setIsEditMode(false);
    }
  }, [isOpen, student, classSessionId]);

  const handleSubmit = async () => {
    try {
      await createOrUpdateAbsences({
        studentIds: [student.id],
        reason,
        proof,
        status,
        classSessionId,
        absenceId: isEditMode ? absenceId : undefined,
      });
      calendarsharedService.emit('absenceUpdated');
      onClose();
    } catch (error) {
      console.error('Failed to submit absence:', error);
    }
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    const newStatus = event.target.value === 'true';
    setStatus(newStatus);

    if (!newStatus) {
      setReason('');
      setProof('');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? `Edit Absence for ${student?.user.firstName} ${student?.user.lastName}` : `Add Absence for ${student?.user.firstName} ${student?.user.lastName}`}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Typography>Loading absence data...</Typography>
        ) : (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={status ? 'true' : 'false'}
                onChange={handleStatusChange}
              >
                <MenuItem value="true">Absent</MenuItem>
                <MenuItem value="false">Present</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              disabled={!status}
            />
            <TextField
              label="Proof"
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              disabled={!status}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary">
          {isEditMode ? 'Update Absence' : 'Add Absence'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AbsenceTab;

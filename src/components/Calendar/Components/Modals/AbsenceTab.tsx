import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { fetchStudents } from 'src/services/studentService';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import { createAbsences } from 'src/services/absence';

interface AbsenceTabProps {
  classSessionId: string; // Accept class session ID as a prop
}

const AbsenceTab: React.FC<AbsenceTabProps> = ({ classSessionId }) => {
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [reason, setReason] = useState<string>('');
  const [proof, setProof] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddAbsence = async () => {
    if (selectedStudents.length === 0 || !reason || !proof) {
      setErrorMessage('All fields are required.');
      return;
    }

    try {
      const studentIds = selectedStudents.map((student) => student.id);
      await createAbsences({
        studentIds,
        reason,
        proof,
        classSessionId,
        status: 'Pending',
      });

      setSelectedStudents([]);
      setReason('');
      setProof('');
      setErrorMessage(null);
      alert('Absences recorded successfully!');
    } catch (error) {
      console.error('Failed to add absences:', error);
      setErrorMessage('Failed to record absences. Please try again.');
    }
  };

  return (
    <Box sx={{ px: 1, mt: 3 }}>

      <Box sx={{ mb: 2 }}>
        <MultiSelectWithCheckboxes
          label="Search Students"
          fetchData={(query: string | undefined) =>
            fetchStudents(1, 5, query).then((data) =>
              data.data.map((student: any) => ({
                ...student,
                fullName: `${student.firstName} ${student.lastName}`,
              }))
            )
          }
          onSelect={(selectedItems: any) => setSelectedStudents(selectedItems)}
          displayProperty="fullName"
          placeholder="Enter student name"
          initialValue={selectedStudents}
          width="100%"
        />
      </Box>

      <TextField
        label="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="Proof"
        value={proof}
        onChange={(e) => setProof(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      {errorMessage && (
        <Typography color="error" sx={{ mb: 2 }}>{errorMessage}</Typography>
      )}

      <Button variant="contained" color="primary" onClick={handleAddAbsence} fullWidth>
        Add Absence
      </Button>
    </Box>
  );
};

export default AbsenceTab;

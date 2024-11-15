import React from 'react';
import { Box, TextField } from '@mui/material';
import moment from 'moment';

export default function DateFields({ newSession, setNewSession, fieldErrors }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Start Date */}
      <TextField
        label="Start Date"
        type="date"
        fullWidth
        value={moment(newSession.startDate).format('YYYY-MM-DD')}
        onChange={(e) => {
          const newStartDate = new Date(e.target.value);
          setNewSession({
            ...newSession,
            startDate: newStartDate,
          });
        }}
        error={!!fieldErrors.startDate}
        helperText={fieldErrors.startDate || ''}
      />

      {/* End Date */}
      <TextField
        label="End Date"
        type="date"
        fullWidth
        value={moment(newSession.endDate).format('YYYY-MM-DD')}
        onChange={(e) => {
          const newEndDate = new Date(e.target.value);
          setNewSession({
            ...newSession,
            endDate: newEndDate,
          });
        }}
        error={!!fieldErrors.endDate}
        helperText={fieldErrors.endDate || ''}
      />
    </Box>
  );
}

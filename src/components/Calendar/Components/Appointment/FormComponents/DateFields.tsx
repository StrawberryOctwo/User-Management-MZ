import React, { useState, useEffect } from 'react';
import { Box, TextField } from '@mui/material';
import moment from 'moment';

export default function DateFields({ session, setSession }) {
  const [fieldErrors, setFieldErrors] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    validateDates(session.startDate, session.endDate);
  }, [session.startDate, session.endDate]);

  const validateDates = (startDate: Date, endDate: Date) => {
    let errors = { startDate: '', endDate: '' };

    if (endDate < startDate) {
      errors.endDate = 'End date cannot be before start date';
    }

    setFieldErrors(errors);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Start Date */}
      <TextField
        label="Start Date"
        type="date"
        fullWidth
        value={moment(session.startDate).format('YYYY-MM-DD')}
        onChange={(e) => {
          const newStartDate = new Date(e.target.value);
          setSession({
            ...session,
            startDate: newStartDate
          });
          validateDates(newStartDate, session.endDate);
        }}
        error={!!fieldErrors.startDate}
        helperText={fieldErrors.startDate || ''}
      />

      {/* End Date */}
      <TextField
        label="End Date"
        type="date"
        fullWidth
        value={moment(session.endDate).format('YYYY-MM-DD')}
        onChange={(e) => {
          const newEndDate = new Date(e.target.value);
          setSession({
            ...session,
            endDate: newEndDate
          });
          validateDates(session.startDate, newEndDate);
        }}
        error={!!fieldErrors.endDate}
        helperText={fieldErrors.endDate || ''}
      />
    </Box>
  );
}

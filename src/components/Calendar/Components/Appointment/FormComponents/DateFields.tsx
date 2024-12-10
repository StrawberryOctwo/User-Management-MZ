import React, { useState, useEffect } from 'react';
import { Box, TextField } from '@mui/material';
import moment from 'moment';
import { t } from "i18next"

export default function DateFields({ session, setSession, isPartial }) {
  const [fieldErrors, setFieldErrors] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    validateDates(session.startDate, session.endDate);
  }, [session.startDate, session.endDate]);

  const validateDates = (startDate: Date | null, endDate: Date | null) => {
    let errors = { startDate: '', endDate: '' };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let normalizedStartDate = null;
    let normalizedEndDate = null;

    if (startDate instanceof Date && !isNaN(startDate.getTime())) {
      normalizedStartDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
    }

    if (endDate instanceof Date && !isNaN(endDate.getTime())) {
      normalizedEndDate = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );
    }

    if (normalizedStartDate || normalizedEndDate) {
      if (
        normalizedEndDate &&
        normalizedStartDate &&
        normalizedEndDate < normalizedStartDate
      ) {
        errors.endDate = 'End date cannot be before start date';
      }
    }

    setFieldErrors(errors);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Start Date */}
      <TextField
        label={t("start_date")}
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
        label={t("end_date")}
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

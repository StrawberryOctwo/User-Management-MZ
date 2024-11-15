import React from 'react';
import {
  Box,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
} from '@mui/material';
import { daysOfWeek, recurrenceOptions } from './AddClassSessionUtils';

export default function RecurrenceOptions({
  recurrencePatternOption,
  handleRecurrenceChange,
  handleDayToggle,
  dayDetails,
  handleDayDetailChange,
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Recurrence Pattern Selection */}
      <Typography variant="h6">Recurrence Pattern</Typography>
      <RadioGroup
        row
        name="recurrence-pattern"
        value={recurrencePatternOption}
        onChange={handleRecurrenceChange}
      >
        {recurrenceOptions.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>

      {/* Show Days Selection for Weekly or Custom */}
      {recurrencePatternOption !== 'once' && (
        <>
          <Typography variant="subtitle1">Select Days</Typography>
          <ToggleButtonGroup
            value={Object.keys(dayDetails)}
            onChange={handleDayToggle}
            aria-label="days of the week"
            exclusive={recurrencePatternOption === 'weekly'} // Allow one day for weekly
            sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.2 }} // Adjust for wrapping and spacing
          >
            {daysOfWeek.map((day) => (
              <ToggleButton
                key={day.value}
                value={day.value}
                aria-label={day.label}
                sx={{
                  width: 51, // Make the button smaller
                  height: 51,
                  fontSize: '0.8rem', // Smaller font size
                  padding: '0.5rem',
                  borderRadius: 1,
                }}
              >
                {day.label.slice(0, 3).toUpperCase()} {/* Use first 3 letters */}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </>
      )}

      {/* Show Start Time and Duration for Selected Days */}
      {recurrencePatternOption === 'custom' && (
        Object.keys(dayDetails).map((day) => (
          <Box key={day} sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label={`${day.charAt(0).toUpperCase() + day.slice(1)} Start Time`}
              type="time"
              fullWidth
              value={dayDetails[day]?.startTime || ''}
              onChange={(e) => handleDayDetailChange(day, 'startTime', e.target.value)}
            />
            <TextField
              label="Duration (mins)"
              type="number"
              fullWidth
              value={dayDetails[day]?.duration || ''}
              onChange={(e) => handleDayDetailChange(day, 'duration', e.target.value)}
            />
          </Box>
        ))
      )}
    </Box>
  );
}

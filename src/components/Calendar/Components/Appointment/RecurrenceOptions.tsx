import {
  Box,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  TextField
} from '@mui/material';
import { useState } from 'react';
import { daysOfWeek, recurrenceOptions } from './AddClassSessionUtils';

export default function RecurrenceOptions({
  recurrencePatternOption,
  handleRecurrenceChange,
  handleDayToggle,
  dayDetails,
  handleDayDetailChange,
  resetDayDetails
}) {
  const [durationError, setDurationError] = useState<Record<string, string>>(
    {}
  );

  const validateDuration = (value: string) => {
    const allowedDurations = [45, 60, 90, 120];
    return allowedDurations.includes(Number(value));
  };

  const handleDurationChange = (day: string, value: string) => {
    const numericValue = Number(value); // Convert the string value to a number

    // Temporarily allow input but show error if invalid
    if (value === '' || !Number.isNaN(numericValue)) {
      handleDayDetailChange(day, 'duration', numericValue);

      if (validateDuration(value)) {
        setDurationError((prev) => ({ ...prev, [day]: '' })); // Clear error
      } else {
        setDurationError((prev) => ({
          ...prev,
          [day]: 'Duration must be 45, 60, 90, or 120'
        }));
      }
    }
  };

  const getDayLabel = (dayValue: string) => {
    const day = daysOfWeek.find((d) => d.value === dayValue);
    return day ? day.label : dayValue;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Recurrence Pattern Selection */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6">Recurrence Pattern:</Typography>
        <RadioGroup
          row
          name="recurrence-pattern"
          value={recurrencePatternOption}
          onChange={(e) => {
            handleRecurrenceChange(e.target.value);
            resetDayDetails();
          }}
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
      </Box>

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
                  width: 51,
                  height: 51,
                  fontSize: '0.8rem',
                  padding: '0.5rem',
                  borderRadius: 1
                }}
              >
                {day.label.slice(0, 3).toUpperCase()}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </>
      )}

      {/* Weekly Start Time and Duration */}
      {recurrencePatternOption === 'weekly' && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Start Time"
            type="time"
            fullWidth
            value={dayDetails['weekly']?.startTime || ''}
            onChange={(e) =>
              handleDayDetailChange('weekly', 'startTime', e.target.value)
            }
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Duration (mins)"
            type="number"
            fullWidth
            value={dayDetails['weekly']?.duration || ''}
            onChange={(e) => handleDurationChange('weekly', e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!durationError['weekly']}
            helperText={durationError['weekly']}
          />
        </Box>
      )}

      {/* Custom Start Time and Duration */}
      {recurrencePatternOption === 'custom' &&
        Object.keys(dayDetails).map((day) => (
          <Box key={day} sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label={`${getDayLabel(day)} Start Time`}
              type="time"
              fullWidth
              value={dayDetails[day]?.startTime || ''}
              onChange={(e) =>
                handleDayDetailChange(day, 'startTime', e.target.value)
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Duration (mins)"
              type="number"
              fullWidth
              value={dayDetails[day]?.duration || ''}
              onChange={(e) => handleDurationChange(day, e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!durationError[day]}
              helperText={durationError[day]}
            />
          </Box>
        ))}
    </Box>
  );
}

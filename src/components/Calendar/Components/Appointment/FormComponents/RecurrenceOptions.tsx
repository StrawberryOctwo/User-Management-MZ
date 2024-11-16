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
import { useEffect, useState } from 'react';
import {
  daysOfWeek,
  recurrenceOptions
} from '../AddClassSession/AddClassSessionUtils';

export default function RecurrenceOptions({
  recurrenceOption,
  handleRecurrenceChange,
  dayDetails,
  setDayDetail,
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
      setDayDetail(day, 'duration', numericValue);

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

  const onlySelectedDay = Object.keys(dayDetails)[0];

  const handleDayToggle = (
    event: React.MouseEvent<HTMLElement>,
    newDay: string | string[]
  ) => {
    let updatedDayDetails = { ...dayDetails };

    if (recurrenceOption === 'weekly') {
      // Allow only one day to be selected for 'weekly'
      if (!newDay || newDay.length === 0) {
        // If unselecting the currently selected day
        updatedDayDetails = {};
      } else {
        if (typeof newDay === 'string') {
          updatedDayDetails = {
            [newDay]: updatedDayDetails[newDay] || {
              startTime: '',
              duration: 0
            }
          };
        }
      }
    } else {
      // Allow multiple days for other recurrence options
      if (!Array.isArray(newDay)) {
        newDay = [newDay];
      }

      // Add new days
      newDay.forEach((day) => {
        if (!updatedDayDetails[day]) {
          updatedDayDetails[day] = { startTime: '', duration: 0 };
        }
      });

      // Remove unselected days
      Object.keys(updatedDayDetails).forEach((day) => {
        if (!newDay.includes(day)) {
          delete updatedDayDetails[day];
        }
      });
    }

    // Update dayDetails using setDayDetail for each day
    resetDayDetails(); // Clear all existing day details
    Object.keys(updatedDayDetails).forEach((day) => {
      setDayDetail(day, 'startTime', updatedDayDetails[day].startTime);
      setDayDetail(day, 'duration', updatedDayDetails[day].duration);
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Recurrence Pattern Selection */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6">Recurrence Pattern:</Typography>
        <RadioGroup
          row
          name="recurrence-pattern"
          value={recurrenceOption}
          onChange={(e) => {
            handleRecurrenceChange(e);
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

      <ToggleButtonGroup
        value={Object.keys(dayDetails)}
        onChange={handleDayToggle}
        aria-label="days of the week"
        exclusive={recurrenceOption === 'weekly'}
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.2 }}
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

      {/* Weekly Start Time and Duration */}
      {recurrenceOption === 'weekly' && onlySelectedDay && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Start Time"
            type="time"
            fullWidth
            value={dayDetails[onlySelectedDay]?.startTime || ''}
            onChange={(e) =>
              setDayDetail(onlySelectedDay, 'startTime', e.target.value)
            }
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Duration (mins)"
            type="number"
            fullWidth
            value={dayDetails[onlySelectedDay]?.duration || ''}
            onChange={(e) =>
              handleDurationChange(onlySelectedDay, e.target.value)
            }
            InputLabelProps={{ shrink: true }}
            error={!!durationError['weekly']}
            helperText={durationError['weekly']}
          />
        </Box>
      )}

      {/* Custom Start Time and Duration */}
      {recurrenceOption === 'custom' &&
        Object.keys(dayDetails).map((day) => (
          <Box key={day} sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label={`${getDayLabel(day)} Start Time`}
              type="time"
              fullWidth
              value={dayDetails[day]?.startTime || ''}
              onChange={(e) => setDayDetail(day, 'startTime', e.target.value)}
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

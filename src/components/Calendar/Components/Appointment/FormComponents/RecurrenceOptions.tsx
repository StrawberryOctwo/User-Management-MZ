import {
  Box,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Select,
  MenuItem
} from '@mui/material';
import {
  allowedDurations,
  daysOfWeek,
  getDayLabel,
  recurrenceOptions
} from '../AddClassSession/AddClassSessionUtils';

export default function RecurrenceOptions({
  recurrenceOption,
  handleRecurrenceChange,
  dayDetails,
  setDayDetail,
  resetDayDetails
}) {
  const onlySelectedDay = Object.keys(dayDetails)[0];

  const handleDayToggle = (
    event: React.MouseEvent<HTMLElement>,
    newDay: string | string[]
  ) => {
    let updatedDayDetails = { ...dayDetails };

    if (recurrenceOption === 'weekly' || recurrenceOption === 'once') {
      // Allow only one day to be selected for 'weekly' and 'once'
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
        exclusive={recurrenceOption === 'weekly' || recurrenceOption === 'once'}
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
              borderRadius: 1,
              mb: 1
            }}
          >
            {day.label.slice(0, 3).toUpperCase()}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Weekly Start Time and Duration */}
      {(recurrenceOption === 'weekly' || recurrenceOption === 'once') &&
        onlySelectedDay && (
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
            <Select
              fullWidth
              value={dayDetails[onlySelectedDay]?.duration || ''}
              onChange={(e) =>
                setDayDetail(
                  onlySelectedDay,
                  'duration',
                  Number(e.target.value)
                )
              }
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Duration
              </MenuItem>
              {allowedDurations.map((duration) => (
                <MenuItem key={duration} value={duration}>
                  {duration} mins
                </MenuItem>
              ))}
            </Select>
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
            <Select
              fullWidth
              value={dayDetails[day]?.duration || ''}
              onChange={(e) =>
                setDayDetail(day, 'duration', Number(e.target.value))
              }
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Duration
              </MenuItem>
              {allowedDurations.map((duration) => (
                <MenuItem key={duration} value={duration}>
                  {duration} mins
                </MenuItem>
              ))}
            </Select>
          </Box>
        ))}
    </Box>
  );
}

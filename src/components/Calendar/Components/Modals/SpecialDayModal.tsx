import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  TextFieldProps
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  updateHoliday,
  addHoliday,
  updateClosingDay,
  addClosingDay,
  fetchClosingDaysByLocationIds,
  fetchHolidaysByLocationIds
} from 'src/services/specialDaysService';
import { SpecialDayData } from '../../types/calendarHelpers';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import { fetchLocations } from 'src/services/locationService';
import { useAuth } from 'src/hooks/useAuth';
import { getStrongestRoles } from 'src/hooks/roleUtils';

interface SpecialDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'Holiday' | 'Closing Day';
  initialData?: SpecialDayData;
  onSuccess: () => void;
  selectedLocations: any[];
}

export default function SpecialDayModal({
  isOpen,
  onClose,
  type,
  initialData,
  onSuccess,
  selectedLocations
}: SpecialDayModalProps) {
  const HOLIDAYS_STORAGE_KEY = 'calendarHolidays';
  const CLOSING_DAYS_STORAGE_KEY = 'calendarClosingDays';

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [isSingleDay, setIsSingleDay] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userRoles } = useAuth();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setStartDate(dayjs(initialData.start_date));
      setEndDate(dayjs(initialData.end_date));
      setLocationId(initialData.locationId);
      setIsSingleDay(initialData.start_date === initialData.end_date);
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setName('');
    setStartDate(null);
    setEndDate(null);
    setLocationId(null);
    setIsSingleDay(false);
    setError('');
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!startDate) {
      setError('Start date is required');
      return false;
    }
    if (!isSingleDay && !endDate) {
      setError('End date is required');
      return false;
    }
    if (!isSingleDay && endDate!.isBefore(startDate)) {
      setError('End date cannot be before start date');
      return false;
    }
    if (!locationId) {
      setError('Location is required');
      return false;
    }
    return true;
  };

  const refreshSpecialDays = async () => {
    try {
      const locationIds = selectedLocations.map(loc => loc.id);
      const currentYear = new Date().getFullYear();

      if (type === 'Holiday') {
        const holidaysResponse = await fetchHolidaysByLocationIds(locationIds, currentYear);
        localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(holidaysResponse.data));
      } else {
        const closingDaysResponse = await fetchClosingDaysByLocationIds(locationIds, currentYear);
        localStorage.setItem(CLOSING_DAYS_STORAGE_KEY, JSON.stringify(closingDaysResponse.data));
      }
    } catch (error) {
      console.error('Error refreshing special days:', error);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const data: SpecialDayData = {
        id: initialData?.id,
        name: name.trim(),
        start_date: startDate!.format('YYYY-MM-DD'),
        end_date: isSingleDay
          ? startDate!.format('YYYY-MM-DD')
          : endDate!.format('YYYY-MM-DD'),
        locationId: locationId!
      };

      let response;

      if (type === 'Holiday') {
        if (initialData?.id) {
          response = await updateHoliday(initialData.id, data);
        } else {
          response = await addHoliday(data);
        }
      } else {
        if (initialData?.id) {
          response = await updateClosingDay(initialData.id, data);
        } else {
          response = await addClosingDay(data);
        }
      }

      // Refresh the special days data in localStorage
      await refreshSpecialDays();

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || `Error saving ${type.toLowerCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const datePickerStyle = {
    width: '100%',
    '& .MuiTextField-root': { width: '100%' }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: { padding: '20px' }
      }}
    >
      <DialogTitle>
        {initialData ? `Edit ${type}` : `Add New ${type}`}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            error={Boolean(error && !name)}
          />
          <SingleSelectWithAutocomplete
            width="100%"
            label="Select Location"
            fetchData={(query) =>
              fetchLocations(1, 5, query).then((data) => data.data)
            }
            onSelect={(location) => {
              setLocationId(location?.id);
            }}
            displayProperty="name"
            placeholder="Search Location"
            initialValue={initialData?.locationId}
          // disabled={!strongestRoles.includes('Teacher')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isSingleDay}
                onChange={(e) => setIsSingleDay(e.target.checked)}
              />
            }
            label="Single Day"
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {isSingleDay ? (
              <DatePicker
                label="Date"
                value={startDate}
                onChange={(newValue) => {
                  setStartDate(newValue);
                  setEndDate(newValue); // Set endDate to the same as startDate
                }}
                renderInput={(props: TextFieldProps) => (
                  <TextField {...props} fullWidth />
                )}
              />
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={datePickerStyle}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    renderInput={(props: TextFieldProps) => (
                      <TextField {...props} fullWidth />
                    )}
                  />
                </Box>
                <Box sx={datePickerStyle}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    renderInput={(props: TextFieldProps) => (
                      <TextField {...props} fullWidth />
                    )}
                  />
                </Box>
              </Box>
            )}
          </LocalizationProvider>
          {type === 'Closing Day' && (
            <Typography variant="body2" color="text.secondary">
              Note: During closing days, no appointments can be scheduled, and
              existing appointments will be disabled.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

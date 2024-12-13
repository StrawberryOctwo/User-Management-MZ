// src/components/AvailableTimesPicker.tsx
import React from 'react';
import {
    Box,
    TextField,
    Typography,
    Grid,
    IconButton
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { RemoveCircle } from '@mui/icons-material';

interface AvailableTimePickerProps {
    availableTime: { start: string; end: string };
    setAvailableTime: React.Dispatch<React.SetStateAction<{ start: string; end: string }>>;
}

const AvailableTimePicker: React.FC<AvailableTimePickerProps> = ({
    availableTime,
    setAvailableTime
}) => {
    const { t } = useTranslation();

    const handleTimeChange = (field: 'start' | 'end', value: string) => {
        setAvailableTime((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
                {t('available_time')}:
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={5} sm={5}>
                    <TextField
                        label={t('start_time')}
                        type="time"
                        value={availableTime.start}
                        onChange={(e) => handleTimeChange('start', e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{
                            step: 300, // 5 minutes
                        }}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid item xs={5} sm={5}>
                    <TextField
                        label={t('end_time')}
                        type="time"
                        value={availableTime.end}
                        onChange={(e) => handleTimeChange('end', e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{
                            step: 300, // 5 minutes
                        }}
                        fullWidth
                        required
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AvailableTimePicker;

import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    IconButton,
    List,
    ListItem,
    Popover,
    TextField,
    Tooltip,
    Typography,
    Grid
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useRef, useState, useEffect } from 'react';
import { fetchAvailabilityForSelf, updateAvailabilityForSelf } from 'src/services/availabilityService';

function HeaderAvailability() {
    const ref = useRef<any>(null);
    const [isOpen, setOpen] = useState<boolean>(false);
    const [availability, setAvailability] = useState<any>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    useEffect(() => {
        loadAvailability();
    }, []);

    const handleOpen = (): void => setOpen(true);
    const handleClose = (): void => setOpen(false);

    const loadAvailability = async () => {
        try {
            const availabilityData = await fetchAvailabilityForSelf();
            const formattedAvailability = formatAvailabilityData(availabilityData);
            setAvailability(formattedAvailability);
        } catch (error) {
            console.error('Failed to load availability:', error);
            setErrorMessage('Failed to load availability');
        }
    };

    const formatAvailabilityData = (data: any[]) => {
        const formatted: any = {};
        daysOfWeek.forEach(day => {
            const dayAvailability = data.find(item => item.dayOfWeek === day);
            formatted[day] = dayAvailability
                ? { 
                    id: dayAvailability.id, 
                    startTime: dayAvailability.startTime, 
                    endTime: dayAvailability.endTime, 
                    checked: !(dayAvailability.startTime === '00:00:00' && dayAvailability.endTime === '00:00:00') 
                  }
                : { startTime: '00:00:00', endTime: '00:00:00', checked: false };
        });
        return formatted;
    };

    const handleTimeChange = (day: string, startTime: string, endTime: string) => {
        setAvailability((prev: any) => ({
            ...prev,
            [day]: {
                ...prev[day],
                startTime: startTime || '00:00:00',
                endTime: endTime || '00:00:00',
                checked: prev[day]?.checked ?? false
            }
        }));
    };

    const handleCheckboxChange = (day: string, isChecked: boolean) => {
        setAvailability((prev: any) => ({
            ...prev,
            [day]: isChecked
                ? { ...prev[day], startTime: '09:00:00', endTime: '17:00:00', checked: true }
                : { ...prev[day], startTime: '00:00:00', endTime: '00:00:00', checked: false }
        }));
    };

    const handleAvailabilitySubmit = async () => {
        try {
            await Promise.all(
                daysOfWeek.map(async (day) => {
                    const { id, startTime, endTime, checked } = availability[day];
                    if (checked || (!checked && startTime === '00:00:00' && endTime === '00:00:00')) {
                        await updateAvailabilityForSelf(id || 0, { dayOfWeek: day, startTime, endTime });
                    }
                })
            );
            handleClose();
        } catch (error) {
            console.error('Failed to update availability:', error);
            setErrorMessage('Failed to update availability');
        }
    };

    return (
        <>
            <Tooltip arrow title="Set Availability">
                <IconButton color="primary" ref={ref} onClick={handleOpen}>
                    <CalendarTodayIcon />
                </IconButton>
            </Tooltip>

            <Popover
                anchorEl={ref.current}
                onClose={handleClose}
                open={isOpen}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                }}
                PaperProps={{
                    sx: { width: 500, maxWidth: '100%', padding: 2 }
                }}
            >
                <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="h5">Set Weekly Availability</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <List sx={{ width: '100%', padding: 0 }}>
                    {daysOfWeek.map((day) => (
                        <ListItem
                            key={day}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'start',
                                gap: 1,
                                mb: 2
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={availability[day]?.checked || false}
                                        onChange={(e) => handleCheckboxChange(day, e.target.checked)}
                                    />
                                }
                                label={<Typography variant="h6">{day}</Typography>}
                            />
                            <Grid container spacing={2} sx={{ pl: 3, width: '100%' }}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Start Time"
                                        type="time"
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        onChange={(e) =>
                                            handleTimeChange(day, e.target.value, availability[day]?.endTime || '')
                                        }
                                        value={availability[day]?.startTime || ''}
                                        disabled={!availability[day]?.checked}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="End Time"
                                        type="time"
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        onChange={(e) =>
                                            handleTimeChange(day, availability[day]?.startTime || '', e.target.value)
                                        }
                                        value={availability[day]?.endTime || ''}
                                        disabled={!availability[day]?.checked}
                                    />
                                </Grid>
                            </Grid>
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{ mt: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAvailabilitySubmit}
                        sx={{ minWidth: 120 }}
                    >
                        Save Availability
                    </Button>
                </Box>
            </Popover>
        </>
    );
}

export default HeaderAvailability;

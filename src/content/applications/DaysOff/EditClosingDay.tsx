import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    CircularProgress,
    Alert,
    Typography,
    Button,
    TextField
} from '@mui/material';
import ReusableForm from 'src/components/Table/tableRowCreate';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import { fetchClosingDayById, updateClosingDay } from 'src/services/specialDaysService';
import { fetchLocations } from 'src/services/locationService';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { fetchTeacherById } from 'src/services/teacherService';
import { t } from 'i18next';

export interface ClosingDayData {
    id?: number;
    name: string;
    start_date: string;
    end_date: string;
    locationId: number;
}

export default function EditClosingDay() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [closingDayData, setClosingDayData] = useState<ClosingDayData | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchClosingDay = async () => {
        setLoading(true);
        try {
            const fetchedData = await fetchClosingDayById(Number(id));
            setClosingDayData({
                id: fetchedData.id,
                name: fetchedData.name,
                start_date: fetchedData.start_date,
                end_date: fetchedData.end_date,
                locationId: fetchedData.locationId,
            });
            setSelectedLocation(fetchedData.location);
        } catch (error) {
            console.error('Error fetching closing day:', error);
            setError('Failed to load closing day');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClosingDay();
    }, [id]);

    const handleLocationSelect = (selectedItem: any) => {
        setSelectedLocation(selectedItem);
    };

    const handleSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        setLoading(true);
        setError(null);

        try {
            if (!selectedLocation) {
                throw new Error('Please select a location.');
            }

            const payload = {
                name: data.name,
                start_date: dayjs(data.start_date).format('YYYY-MM-DD'),
                end_date: dayjs(data.end_date).format('YYYY-MM-DD'),
                locationId: selectedLocation.id,
            };

            const response = await updateClosingDay(Number(id), payload);

            const CLOSING_DAYS_STORAGE_KEY = 'calendarClosingDays';
            const storedClosingDays = JSON.parse(localStorage.getItem(CLOSING_DAYS_STORAGE_KEY) || '[]');
            const updatedClosingDays = storedClosingDays.map((closingDay: any) =>
                closingDay.id === Number(id) ? { ...closingDay, ...payload } : closingDay
            );
            localStorage.setItem(CLOSING_DAYS_STORAGE_KEY, JSON.stringify(updatedClosingDays));

            fetchClosingDay();
            return response;
        } catch (error: any) {
            console.error('Error updating closing day:', error);
            setError(error.message || 'Failed to update closing day');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const closingDayFields = [
        {
            name: 'name',
            label: 'Closing Day Name',
            type: 'text',
            required: true,
            section: 'Closing Day Information'
        },
        {
            name: 'location',
            label: t('location'),
            type: 'custom',
            section: 'Closing Day Information',
            component: (
                <SingleSelectWithAutocomplete
                    width="100%"
                    label="Select Location"
                    fetchData={(query) => fetchLocations(1, 5, query).then((data) => data.data)}
                    onSelect={handleLocationSelect}
                    displayProperty="name"
                    placeholder="Search Location"
                    initialValue={selectedLocation}
                />
            ),
        },
        {
            name: 'start_date',
            label: 'Start Date',
            type: 'custom',
            section: 'Closing Day Dates',
            component: (
                <DatePicker
                    label="Start Date"
                    value={closingDayData?.start_date ? dayjs(closingDayData.start_date) : null}
                    onChange={(newValue) => {
                        if (closingDayData) {
                            setClosingDayData({
                                ...closingDayData,
                                start_date: newValue ? dayjs(newValue).format('YYYY-MM-DD') : ''
                            });
                        }
                    }}
                    renderInput={(params) => <TextField {...params} />}
                />
            ),
        },
        {
            name: 'end_date',
            label: 'End Date',
            type: 'custom',
            section: 'Closing Day Dates',
            component: (
                <DatePicker
                    label="End Date"
                    value={closingDayData?.end_date ? dayjs(closingDayData.end_date) : null}
                    onChange={(newValue) => {
                        if (closingDayData) {
                            setClosingDayData({
                                ...closingDayData,
                                end_date: newValue ? dayjs(newValue).format('YYYY-MM-DD') : ''
                            });
                        }
                    }}
                    renderInput={(params) => <TextField {...params} />}
                />
            ),
        },
    ];

    if (loading && !closingDayData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4">Edit Closing Day</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Note: During closing days, no appointments can be scheduled, and
                    existing appointments will be disabled.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {closingDayData && (
                <ReusableForm
                    fields={closingDayFields}
                    onSubmit={handleSubmit}
                    initialData={closingDayData}
                    entityName="Closing Day"
                    entintyFunction="Edit"
                />
            )}
        </Box>
    );
}

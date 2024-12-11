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
import { fetchHolidayById, updateHoliday } from 'src/services/specialDaysService';
import { fetchLocations } from 'src/services/locationService';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { t } from 'i18next';

export interface HolidayData {
    id?: number;
    name: string;
    start_date: string;
    end_date: string;
    locationId: number;
}

export default function EditHoliday() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [holidayData, setHolidayData] = useState<HolidayData | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHoliday = async () => {
        setLoading(true);
        try {
            const fetchedData = await fetchHolidayById(Number(id));
            setHolidayData({
                id: fetchedData.id,
                name: fetchedData.name,
                start_date: fetchedData.start_date,
                end_date: fetchedData.end_date,
                locationId: fetchedData.locationId,
            });
            setSelectedLocation(fetchedData.location);
        } catch (error) {
            console.error('Error fetching holiday:', error);
            setError('Failed to load holiday');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHoliday();
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

            const response = await updateHoliday(Number(id), payload);

            const HOLIDAYS_STORAGE_KEY = 'calendarHolidays';
            const storedHolidays = JSON.parse(localStorage.getItem(HOLIDAYS_STORAGE_KEY) || '[]');
            const updatedHolidays = storedHolidays.map((holiday: any) =>
                holiday.id === Number(id) ? { ...holiday, ...payload } : holiday
            );
            localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(updatedHolidays));

            fetchHoliday();
            return response;
        } catch (error: any) {
            console.error('Error updating holiday:', error);
            setError(error.message || 'Failed to update holiday');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const holidayFields = [
        {
            name: 'name',
            label: 'Holiday Name',
            type: 'text',
            required: true,
            section: 'Holiday Information'
        },
        {
            name: 'location',
            label: t('location'),
            type: 'custom',
            section: 'Holiday Information',
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
            section: 'Holiday Dates',
            component: (
                <DatePicker
                    label="Start Date"
                    value={holidayData?.start_date ? dayjs(holidayData.start_date) : null}
                    onChange={(newValue) => {
                        if (holidayData) {
                            setHolidayData({
                                ...holidayData,
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
            section: 'Holiday Dates',
            component: (
                <DatePicker
                    label="End Date"
                    value={holidayData?.end_date ? dayjs(holidayData.end_date) : null}
                    onChange={(newValue) => {
                        if (holidayData) {
                            setHolidayData({
                                ...holidayData,
                                end_date: newValue ? dayjs(newValue).format('YYYY-MM-DD') : ''
                            });
                        }
                    }}
                    renderInput={(params) => <TextField {...params} />}
                />
            ),
        },
    ];

    if (loading && !holidayData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4">Edit Holiday</Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {holidayData && (
                <ReusableForm
                    fields={holidayFields}
                    onSubmit={handleSubmit}
                    initialData={holidayData}
                    entityName="Holiday"
                    entintyFunction="Edit"
                />
            )}
        </Box>
    );
}

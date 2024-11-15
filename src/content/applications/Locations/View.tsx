import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { t } from 'i18next';
import { format } from 'date-fns';
import { fetchLocationById } from 'src/services/locationService'; // Adjust the import path as necessary
import ReusableDetails from 'src/components/View'; // Adjust the reusable details component path

const ViewLocationPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [location, setLocation] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error state for the page

    // Function to load the location by ID
    const loadLocation = async () => {
        setLoading(true);
        setErrorMessage(null); // Clear previous errors

        try {
            const locationData = await fetchLocationById(Number(id));
            setLocation(locationData);
        } catch (error: any) {
            setErrorMessage(t('failed_to_fetch_location')); // Set error message for retry mechanism
            console.error('Failed to fetch location:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadLocation(); // Fetch location data on component mount
        }
    }, [id, t]);

    const formattedCreatedAt = location ? format(new Date(location.createdAt), 'PPpp') : '';

    // Define fields for the ReusableDetails component
    const Fields = [
        { name: 'name', label: t('location_name'), section: t('general') },
        { name: 'address', label: t('address'), section: t('general') },
        { name: 'city', label: t('city'), section: t('general') },
        { name: 'createdAt', label: t('created_date'), section: t('general') },
        { name: 'franchise.name', label: t('franchise_name'), section: t('franchise') }, // Access nested field
        { name: 'franchise.ownerName', label: t('owner_name'), section: t('franchise') },
        { name: 'franchise.cardHolderName', label: t('card_holder_name'), section: t('franchise') },
        { name: 'franchise.status', label: t('status'), section: t('franchise') },
        { name: 'franchise.totalEmployees', label: t('total_employees'), section: t('franchise') },
        {
            name: 'admins',
            label: t('admins'),
            section: t('admins'),
            isArray: true, // Indicate this is an array field
            columns: [
                { field: 'firstName', headerName: t('first_name'), flex: 1 },
                { field: 'lastName', headerName: t('last_name'), flex: 1 },
                { field: 'email', headerName: t('email'), flex: 1 },
                {
                    field: 'actions',
                    headerName: t('actions'),
                    renderCell: (params: { row: { id: any } }) => (
                        <Button
                            variant="text"
                            color="primary"
                            onClick={() => window.open(`/management/location-admins/view/${params.row.id}`, '_blank')}
                        >
                            {t('view_details')}
                        </Button>
                    ),
                    sortable: false,
                    width: 150,
                },
            ], // Define columns for the array
        },
        {
            name: 'teachers',
            label: t('teachers'),
            section: t('teachers'),
            isArray: true, // Indicate this is an array field
            columns: [
                { field: 'firstName', headerName: t('first_name'), flex: 1 },
                { field: 'lastName', headerName: t('last_name'), flex: 1 },
                { field: 'email', headerName: t('email'), flex: 1 },
                { field: 'employeeNumber', headerName: t('employee_number'), flex: 1 },
                { field: 'idNumber', headerName: t('id_number'), flex: 1 },
                { field: 'contractStartDate', headerName: t('contract_start_date'), flex: 1 },
                { field: 'contractEndDate', headerName: t('contract_end_date'), flex: 1 },
                { field: 'hourlyRate', headerName: t('hourly_rate'), flex: 1 },
                {
                    field: 'actions',
                    headerName: t('actions'),
                    renderCell: (params: { row: { id: any } }) => (
                        <Button
                            variant="text"
                            color="primary"
                            onClick={() => window.open(`/management/teachers/view/${params.row.id}`, '_blank')}
                        >
                            {t('view_details')}
                        </Button>
                    ),
                    sortable: false,
                    width: 150,
                },
            ], // Define columns for the array
        },
        {
            name: 'students',
            label: t('students'),
            section: t('students'),
            isArray: true, // Indicate this is an array field
            columns: [
                { field: 'firstName', headerName: t('first_name'), flex: 1 },
                { field: 'lastName', headerName: t('last_name'), flex: 1 },
                { field: 'payPerHour', headerName: t('pay_per_hour'), flex: 1 },
                { field: 'status', headerName: t('status'), flex: 1 },
                { field: 'contractType', headerName: t('contract_type'), flex: 1 },
                { field: 'contractEndDate', headerName: t('contract_end_date'), flex: 1 },
                { field: 'gradeLevel', headerName: t('grade_level'), flex: 1 },
                {
                    field: 'actions',
                    headerName: t('actions'),
                    renderCell: (params: { row: { id: any } }) => (
                        <Button
                            variant="text"
                            color="primary"
                            onClick={() => window.open(`/management/students/view/${params.row.id}`, '_blank')}
                        >
                            {t('view_details')}
                        </Button>
                    ),
                    sortable: false,
                    width: 150,
                },
            ], // Define columns for the array
        },
    ];

    // Transform data to support nested field access and format dates
    const transformedData = {
        ...location,
        'franchise.name': location?.franchise?.name,
        'franchise.ownerName': location?.franchise?.ownerName,
        'franchise.cardHolderName': location?.franchise?.cardHolderName,
        'franchise.status': location?.franchise?.status,
        'franchise.totalEmployees': location?.franchise?.totalEmployees,
        'createdAt': formattedCreatedAt, // Already formatted date
        'teachers': location?.teachers?.map((teacher: any) => ({
            ...teacher,
            contractStartDate: teacher.contractStartDate ? format(new Date(teacher.contractStartDate), 'dd-MM-yyyy') : '', // Format date
            contractEndDate: teacher.contractEndDate ? format(new Date(teacher.contractEndDate), 'dd-MM-yyyy') : '', // Format date
        })),
        'students': location?.students?.map((student: any) => ({
            ...student,
            contractEndDate: student.contractEndDate ? format(new Date(student.contractEndDate), 'dd-MM-yyyy') : '', // Format date
        })),
    };

    return (
        <Box sx={{ position: 'relative', padding: 4 }}>
            {loading ? (
                <Typography variant="h6">{t('loading')}</Typography>
            ) : errorMessage ? (
                <Typography variant="h6" color="error">
                    {errorMessage}
                </Typography>
            ) : location ? (
                <ReusableDetails fields={Fields} data={transformedData} entityName={t(location.name)} />
            ) : (
                <Typography variant="h6">{t('no_location_data_available')}</Typography>
            )}
        </Box>
    );
};

export default ViewLocationPage;

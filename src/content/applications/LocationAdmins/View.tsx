import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { t } from 'i18next';
import { format } from 'date-fns';
import { fetchLocationAdminById } from 'src/services/locationAdminService';
import ReusableDetails from 'src/components/View';

const ViewLocationAdmin: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [locationAdmin, setLocationAdmin] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Function to load the location admin by ID
    const loadLocationAdmin = async () => {
        setLoading(true);
        setErrorMessage(null);

        try {
            const locationAdminData = await fetchLocationAdminById(Number(id));
            setLocationAdmin(locationAdminData);
        } catch (error: any) {
            console.error('Failed to fetch location admin:', error);
            setErrorMessage(t('failed_to_fetch_LocationAdmin'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadLocationAdmin();
        }
    }, [id, t]);

    const formattedDob = locationAdmin ? format(new Date(locationAdmin.dob), 'PP') : '';

    // Define fields for the ReusableDetails component
    const Fields = [
        { name: 'firstName', label: t('first_name'), section: t('admin_details') },
        { name: 'lastName', label: t('last_name'), section: t('admin_details') },
        { name: 'dob', label: t('dob'), section: t('admin_details') },
        { name: 'email', label: t('email'), section: t('admin_details') },
        { name: 'address', label: t('address'), section: t('admin_details') },
        { name: 'postalCode', label: t('postal_code'), section: t('admin_details') },
        { name: 'phoneNumber', label: t('phone_number'), section: t('admin_details') },
        {
            name: 'locations',
            label: t('locations'),
            section: t('locations'),
            isArray: true,
            columns: [
                { field: 'name', headerName: t('location_name'), flex: 1 },
                { field: 'address', headerName: t('address'), flex: 1 },
                { field: 'postalCode', headerName: t('postal_code'), flex: 1 },
                { field: 'created_at', headerName: t('created_date'), flex: 1 },
                {
                    field: 'actions',
                    headerName: t('actions'),
                    renderCell: (params: { row: { id: any } }) => (
                        <Button
                            variant="text"
                            color="primary"
                            onClick={() => window.open(`/dashboard/locations/view/${params.row.id}`, '_blank')}
                        >
                            {t('view_details')}
                        </Button>
                    ),
                    sortable: false,
                    width: 150,
                },
            ],
        },
    ];

    // Transform data for ReusableDetails
    const transformedData = {
        ...locationAdmin,
        'dob': formattedDob,
    };

    return (
        <Box sx={{ position: 'relative', padding: 4 }}>
            {loading ? (
                <Typography variant="h6">{t('loading')}</Typography>
            ) : errorMessage ? (
                <Typography variant="h6" color="error">{errorMessage}</Typography>
            ) : locationAdmin ? (
                <ReusableDetails
                    fields={Fields}
                    data={transformedData}
                    entityName={`${locationAdmin.firstName} ${locationAdmin.lastName}`}
                />
            ) : (
                <Typography variant="h6">{t('no_location_admin_data_available')}</Typography>
            )}
        </Box>
    );
};

export default ViewLocationAdmin;

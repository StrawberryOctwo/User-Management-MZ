import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { t } from 'i18next';
import { format } from 'date-fns';
import { fetchFranchiseById } from 'src/services/franchiseService';
import ReusableDetails from 'src/components/View';

const ViewFranchisePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [franchise, setFranchise] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);

    const loadFranchise = async () => {
        setLoading(true);

        try {
            const franchiseData = await fetchFranchiseById(Number(id));
            setFranchise(franchiseData);
        } catch (error: any) {

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadFranchise();
        }
    }, [id, t]);

    const Fields = [
        { name: 'name', label: t('franchise_name'), section: t('general') },
        { name: 'ownerName', label: t('owner_name'), section: t('general') },
        { name: 'cardHolderName', label: t('card_holder_name'), section: t('general') },
        { name: 'iban', label: t('iban'), section: t('general') },
        { name: 'bic', label: t('bic'), section: t('general') },
        { name: 'status', label: t('status'), section: t('general') },
        { name: 'totalEmployees', label: t('total_employees'), section: t('general') },
        { name: 'city', label: t('city'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'address', label: t('address'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'postalCode', label: t('postalCode'), type: 'text', required: true, section: 'Franchise Information' },
        {
            name: 'admins',
            label: t('franchise_admins'),
            section: t('admins'),
            isArray: true,
            columns: [
                { field: 'firstName', headerName: t('first_name'), flex: 1 },
                { field: 'lastName', headerName: t('last_name'), flex: 1 },
                { field: 'email', headerName: t('email'), flex: 1 },
                { field: 'address', headerName: t('address'), flex: 1 },
                { field: 'postalCode', headerName: t('postal_code'), flex: 1 },
                { field: 'phoneNumber', headerName: t('phone_number'), flex: 1 },
                {
                    field: 'actions',
                    headerName: t('actions'),
                    renderCell: (params: { row: { id: any; }; }) => (
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
            ],
        },
        {
            name: 'locations',
            label: t('locations'),
            section: t('locations'),
            isArray: true,
            columns: [
                { field: 'name', headerName: t('location_name'), flex: 1 },
                { field: 'address', headerName: t('address'), flex: 1 },
                { field: 'postalCode', headerName: t('postal_code'), flex: 1 }, {
                    field: 'actions',
                    headerName: t('actions'),
                    renderCell: (params: { row: { id: any; }; }) => (
                        <Button
                            variant="text"
                            color="primary"
                            onClick={() => window.open(`/management/locations/view/${params.row.id}`, '_blank')}
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

    const transformedData = {
        ...franchise,
        'createdAt': franchise?.createdAt ? format(new Date(franchise.createdAt), 'PPpp') : '',
    };

    return (
        <Box sx={{ position: 'relative', padding: 4 }}>
            {franchise ? (
                <ReusableDetails
                    fields={Fields}
                    data={transformedData}
                    entityName={t(franchise.name)}
                />
            ) : (
                <Typography variant="h6">No franchise data available</Typography>
            )}
        </Box>
    );
};

export default ViewFranchisePage;

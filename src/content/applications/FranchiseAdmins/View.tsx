import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { t } from 'i18next';
import { format } from 'date-fns';
import { fetchFranchiseAdminById } from 'src/services/franchiseAdminService';
import ReusableDetails from 'src/components/View';

const ViewFranchiseAdmin: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [franchiseAdmin, setFranchiseAdmin] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadFranchiseAdmin = async () => {
        setLoading(true);
        try {
            const franchiseAdminData = await fetchFranchiseAdminById(Number(id));
            setFranchiseAdmin(franchiseAdminData);
        } catch (error: any) {
            setErrorMessage(t('failed_to_fetch_admin'));
            console.error('Failed to fetch franchise admin:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadFranchiseAdmin();
        }
    }, [id, t]);

    const Fields = [
        { name: 'firstName', label: t('first_name'), section: t('admin_details') },
        { name: 'lastName', label: t('last_name'), section: t('admin_details') },
        { name: 'dob', label: t('dob'), section: t('admin_details') },
        { name: 'email', label: t('email'), section: t('admin_details') },
        { name: 'city', label: t('city'), section: t('admin_details') },
        { name: 'address', label: t('address'), section: t('admin_details') },
        { name: 'postalCode', label: t('postal_code'), section: t('admin_details') },
        { name: 'phoneNumber', label: t('phone_number'), section: t('admin_details') },
        {
            name: 'franchises',
            label: t('franchises'),
            section: t('franchises'),
            isArray: true,
            columns: [
                { field: 'name', headerName: t('franchise_name'), flex: 1 },
                {
                    field: 'actions',
                    headerName: t('actions'),
                    renderCell: (params: { row: { id: any } }) => (
                        <Button
                            variant="text"
                            color="primary"
                            onClick={() => window.open(`/management/franchises/view/${params.row.id}`, '_blank')}
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
        ...franchiseAdmin,
        'dob': franchiseAdmin?.dob ? format(new Date(franchiseAdmin.dob), 'PP') : '',
    };

    return (
        <Box sx={{ position: 'relative', padding: 4 }}>
            {loading ? (
                <Typography variant="h6">{t('loading')}</Typography>
            ) : errorMessage ? (
                <Typography variant="h6" color="error">{errorMessage}</Typography>
            ) : franchiseAdmin ? (
                <ReusableDetails
                    fields={Fields}
                    data={transformedData}
                    entityName={`${franchiseAdmin.firstName} ${franchiseAdmin.lastName}`}
                />
            ) : (
                <Typography variant="h6">{t('no_admin_data_available')}</Typography>
            )}
        </Box>
    );
};

export default ViewFranchiseAdmin;

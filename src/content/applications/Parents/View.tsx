import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { t } from 'i18next';
import { format } from 'date-fns';
import { fetchParentById } from 'src/services/parentService';
import ReusableDetails from 'src/components/View';

const ViewParent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [parent, setParent] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Function to load the parent by ID
    const loadParent = async () => {
        setLoading(true);
        setErrorMessage(null);

        try {
            const parentData = await fetchParentById(Number(id));

            // Flatten user data into the parent object
            const flattenedData = {
                ...parentData,
                firstName: parentData.user?.firstName,
                lastName: parentData.user?.lastName,
                dob: parentData.user?.dob ? format(new Date(parentData.user.dob), 'PP') : '',
                email: parentData.user?.email,
                address: parentData.user?.address,
                postalCode: parentData.user?.postalCode,
                phoneNumber: parentData.user?.phoneNumber,
            };

            setParent(flattenedData);
        } catch (error: any) {
            console.error('Failed to fetch parent:', error);
            setErrorMessage(t('failed_to_fetch_parent'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadParent();
        }
    }, [id, t]);

    // Define fields for the ReusableDetails component
    const Fields = [
        { name: 'firstName', label: t('first_name'), section: t('parent_details') },
        { name: 'lastName', label: t('last_name'), section: t('parent_details') },
        { name: 'dob', label: t('dob'), section: t('parent_details') },
        { name: 'email', label: t('email'), section: t('parent_details') },
        { name: 'address', label: t('address'), section: t('parent_details') },
        { name: 'postalCode', label: t('postal_code'), section: t('parent_details') },
        { name: 'phoneNumber', label: t('phone_number'), section: t('parent_details') },
        { name: 'accountHolder', label: t('account_holder'), section: t('banking_details') },
        { name: 'iban', label: t('iban'), section: t('banking_details') },
        { name: 'bic', label: t('bic'), section: t('banking_details') },
    ];

    return (
        <Box sx={{ position: 'relative', padding: 4 }}>
            {loading ? (
                <Typography variant="h6">{t('loading')}</Typography>
            ) : errorMessage ? (
                <Typography variant="h6" color="error">{errorMessage}</Typography>
            ) : parent ? (
                <ReusableDetails
                    fields={Fields}
                    data={parent}
                    entityName={`${parent.firstName} ${parent.lastName}`}
                />
            ) : (
                <Typography variant="h6">{t('no_parent_data_available')}</Typography>
            )}
        </Box>
    );
};

export default ViewParent;

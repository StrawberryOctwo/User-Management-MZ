import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { t } from 'i18next';
import { useParams } from 'react-router-dom';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';
import { fetchParentById, updateParent } from 'src/services/parentService';
import { useSnackbar } from 'src/contexts/SnackbarContext';

const EditParent = () => {
    const { id } = useParams<{ id: string }>();
    const [parentData, setParentData] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const { showMessage } = useSnackbar();

    const fetchParent = async () => {
        setLoading(true);
        try {
            const fetchedData = await fetchParentById(Number(id));

            const flattenedData = {
                firstName: fetchedData.user.firstName,
                lastName: fetchedData.user.lastName,
                email: fetchedData.user.email,
                password: '',
                dob: formatDateForInput(fetchedData.user.dob),
                city: fetchedData.user.city,
                address: fetchedData.user.address,
                postalCode: fetchedData.user.postalCode,
                phoneNumber: fetchedData.user.phoneNumber,
                accountHolder: fetchedData.accountHolder,
                iban: fetchedData.iban,
                bic: fetchedData.bic,
            };

            setParentData(flattenedData);
        } catch (error) {
            console.error('Error fetching Parent:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParent();
    }, [id]);

    const handleSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        if (data.password && data.password !== data.confirmPassword) {
            showMessage("Passwords do not match", 'error');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                user: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    password: data.password || undefined,
                    dob: data.dob,
                    city: data.city,
                    address: data.address,
                    postalCode: data.postalCode,
                    phoneNumber: data.phoneNumber,
                },
                parent: {
                    accountHolder: data.accountHolder,
                    iban: data.iban,
                    bic: data.bic,
                },
            };

            const response = await updateParent(Number(id), payload);
            await fetchParent();

            return response;
        } catch (error: any) {
            console.error("Error updating Parent:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const formatDateForInput = (date: string) => {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const userFields: FieldConfig[] = [
        { name: 'firstName', label: t('first_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'lastName', label: t('last_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'dob', label: t('dob'), type: 'date', required: true, section: 'User Information' },
        { name: 'email', label: t('email'), type: 'email', required: true, section: 'User Information' },
        { name: 'city', label: t('city'), type: 'text', required: true, section: 'User Information' },
        { name: 'address', label: t('address'), type: 'text', required: true, section: 'User Information' },
        { name: 'postalCode', label: t('postal_code'), type: 'text', required: true, section: 'User Information' },
        { name: 'phoneNumber', label: t('phone_number'), type: 'text', required: true, section: 'User Information' },
        { name: 'password', label: t('new_password'), type: 'password', required: false, section: 'Change Password' },
        { name: 'confirmPassword', label: t('confirm_password'), type: 'password', required: false, section: 'Change Password' },
    ];

    const bankingFields: FieldConfig[] = [
        { name: 'accountHolder', label: t('account_holder'), type: 'text', required: true, section: 'Banking Information' },
        { name: 'iban', label: t('iban'), type: 'text', required: true, section: 'Banking Information' },
        { name: 'bic', label: t('bic'), type: 'text', required: false, section: 'Banking Information' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!loading && parentData && (
                <ReusableForm
                    fields={[...userFields, ...bankingFields]}
                    onSubmit={handleSubmit}
                    initialData={parentData}
                    entityName="Parent"
                    entintyFunction="Edit"
                />
            )}
        </Box>
    );
};

export default EditParent;

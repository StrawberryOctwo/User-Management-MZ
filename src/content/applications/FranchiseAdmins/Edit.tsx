import React, { useState, useEffect, useRef } from 'react';

import Box from '@mui/material/Box';

import { useParams } from 'react-router-dom';
import { t } from 'i18next';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';
import { fetchFranchiseAdminById, updateFranchiseAdmin } from 'src/services/franchiseAdminService';
import { fetchFranchises } from 'src/services/franchiseService';
import { useSnackbar } from 'src/contexts/SnackbarContext';

export default function EditFranchiseAdmin() {
    const { id } = useParams<{ id: string }>();
    const [adminData, setAdminData] = useState<Record<string, any> | null>(null);
    const [selectedFranchises, setSelectedFranchises] = useState<any[]>([]);
    const dropdownRef = useRef<any>(null);
    const [loading, setLoading] = useState(false);
    const { showMessage } = useSnackbar();
    const franchiseRef = useRef<any>(null);

    const formatDateForInput = (date: string) => {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const fetchedData = await fetchFranchiseAdminById(Number(id));

            if (!fetchedData) {
                throw new Error('No data received for the franchise admin');
            }

            const userData = fetchedData || {};

            const flattenedData = {
                ...fetchedData,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                dob: formatDateForInput(userData.dob) || '',
                email: userData.email || '',
                city: userData.city || '',
                address: userData.address || '',
                postalCode: userData.postalCode || '',
                phoneNumber: userData.phoneNumber || '',
            };

            setAdminData(flattenedData);
            setSelectedFranchises(fetchedData.franchises || []);
        } catch (error) {
            console.error('Error fetching franchise admin:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, [id]);


    const handleFranchiseSelect = (selectedItems: any[]) => {
        setSelectedFranchises(selectedItems);
    };

    const handleAdminSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        if (data.password && data.password !== data.confirmPassword) {
            showMessage("Passwords do not match", 'error');
            return;
        }

        setLoading(true);
        try {
            const franchiseIds = franchiseRef.current?.selectedItems?.map(
                (franchise: { id: any }) => franchise.id
            ) || [];

            if (selectedFranchises.length === 0) {
                throw new Error('Please select at least one franchise.');
            }


            const payload = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                dob: formatDateForInput(data.dob),
                city: data.city,
                address: data.address,
                postalCode: data.postalCode,
                phoneNumber: data.phoneNumber,
                franchiseIds,
                password: data.password
            };

            const response = await updateFranchiseAdmin(Number(id), payload);

            await fetchAdminData();

            if (dropdownRef.current) {
                dropdownRef.current.reset();
            }

            return response;
        }
        catch (error: any) {
            console.error("Error updating Franchise Admin:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const adminFields: FieldConfig[] = [
        { name: 'firstName', label: t('first_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'lastName', label: t('last_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'email', label: t('email'), type: 'email', required: true, section: 'User Information' },
        { name: 'dob', label: t('dob'), type: 'date', required: true, section: 'User Information' },
        { name: 'city', label: t('city'), type: 'text', required: true, section: 'User Information' },
        { name: 'address', label: t('address'), type: 'text', required: true, section: 'User Information' },
        { name: 'postalCode', label: t('postal_code'), type: 'text', required: true, section: 'User Information' },
        { name: 'phoneNumber', label: t('phone_number'), type: 'number', required: true, section: 'User Information' },
        { name: 'password', label: t('new_password'), type: 'password', required: false, section: 'Change Password' },
        { name: 'confirmPassword', label: t('confirm_password'), type: 'password', required: false, section: 'Change Password' },
    ];

    const otherFields = [
        {
            name: 'franchises',
            label: t('Franchises'),
            type: 'custom',
            section: 'Franchise Admin Assignment',
            component: (
                <MultiSelectWithCheckboxes
                    ref={franchiseRef}
                    label={t('Search_and_assign_franchises')}
                    fetchData={(query) => fetchFranchises(1, 5, query).then((data) => data.data)}
                    onSelect={handleFranchiseSelect}
                    displayProperty="name"
                    placeholder="Type to search franchises"
                    initialValue={selectedFranchises}
                />
            ),
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!loading && adminData && (
                <ReusableForm
                    fields={[...adminFields, ...otherFields]}
                    onSubmit={handleAdminSubmit}
                    initialData={adminData}
                    entityName="Franchise Admin"
                    entintyFunction="Edit"
                />
            )}
        </Box>
    );
}

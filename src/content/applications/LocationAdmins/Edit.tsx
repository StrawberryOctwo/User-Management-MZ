import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';

import { t } from 'i18next';
import { useParams } from 'react-router-dom';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';
import { fetchLocationAdminById, updateLocationAdmin } from 'src/services/locationAdminService';
import { fetchLocations } from 'src/services/locationService';
import { useSnackbar } from 'src/contexts/SnackbarContext';


const EditLocationAdmin = () => {
    const { id } = useParams<{ id: string }>();
    const [locationAdminData, setLocationAdminData] = useState<Record<string, any> | null>(null);
    const [selectedLocations, setSelectedLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const locationRef = useRef<any>(null);
    const { showMessage } = useSnackbar();

    const fetchLocationAdmin = async () => {
        setLoading(true);
        try {
            const fetchedData = await fetchLocationAdminById(Number(id));

            // Pre-fill form fields with fetched data
            const flattenedData = {
                firstName: fetchedData.firstName,
                lastName: fetchedData.lastName,
                dob: formatDateForInput(fetchedData.dob),
                email: fetchedData.email,
                city: fetchedData.city,
                address: fetchedData.address,
                postalCode: fetchedData.postalCode,
                phoneNumber: fetchedData.phoneNumber,
                password: '',
            };

            setLocationAdminData(flattenedData);
            setSelectedLocations(fetchedData.locations);
        } catch (error) {
            console.error('Error fetching Location Admin:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocationAdmin();
    }, [id]);

    const handleLocationSelect = (selectedItems: any[]) => {
        setSelectedLocations(selectedItems);
    };

    const handleSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        if (data.password && data.password !== data.confirmPassword) {
            showMessage("Passwords do not match", 'error');
            return;
        }

        setLoading(true);
        try {
            const locationIds = locationRef.current?.selectedItems?.map((location: { id: any }) => location.id) || [];

            const payload = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password || undefined,
                dob: data.dob,
                city: data.city,
                address: data.address,
                postalCode: data.postalCode,
                phoneNumber: data.phoneNumber,
                locationIds: locationIds,
            };

            const response = await updateLocationAdmin(Number(id), payload);

            await fetchLocationAdmin();

            return response;
        } catch (error: any) {
            console.error("Error updating Location Admin:", error);
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
        { name: 'phoneNumber', label: t('phone_number'), type: 'number', required: true, section: 'User Information' },
        { name: 'password', label: t('new_password'), type: 'password', required: false, section: 'Change Password' },
        { name: 'confirmPassword', label: t('confirm_password'), type: 'password', required: false, section: 'Change Password' },
    ];

    const otherFields = [
        {
            name: 'locations',
            label: t('locations'),
            type: 'custom',
            section: 'Location Admin Assignment',
            component: (
                <MultiSelectWithCheckboxes
                    label={t('Search_and_assign_locations')}
                    fetchData={(query) => fetchLocations(1, 5, query).then((data) => data.data)}
                    onSelect={handleLocationSelect}
                    displayProperty="name"
                    placeholder="Type to search locations"
                    ref={locationRef}
                    initialValue={selectedLocations}
                />
            ),
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!loading && locationAdminData && (
                <ReusableForm
                    fields={[...userFields, ...otherFields]}
                    onSubmit={handleSubmit}
                    initialData={locationAdminData}
                    entityName="Location Admin"
                    entintyFunction="Edit"
                />
            )}
        </Box>
    );
};

export default EditLocationAdmin;

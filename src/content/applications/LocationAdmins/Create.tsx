import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { t } from 'i18next';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';
import { addLocationAdmin } from 'src/services/locationAdminService';
import { fetchLocations } from 'src/services/locationService';


const CreateLocationAdmin = () => {
    const [selectedLocations, setSelectedLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleLocationSelect = (selectedItems: any[]) => {
        setSelectedLocations(selectedItems);
    };

    const locationRef = useRef<any>(null);

    const handleSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        setLoading(true);
        try {
            const locationIds = locationRef.current?.selectedItems?.map((location: { id: any }) => location.id) || [];

            const payload = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
                dob: data.dob,
                address: data.address,
                city: data.city,
                postalCode: data.postalCode,
                phoneNumber: data.phoneNumber,
                locationIds: locationIds,
            };

            const response = await addLocationAdmin(payload);

            setSelectedLocations([]);
            if (locationRef.current) {
                locationRef.current.reset();
            }

            setTimeout(() => {
                window.location.reload();
            }, 1500);

            return response;
        } catch (error: any) {
            console.error("Error adding entity:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };


    const userFields: FieldConfig[] = [
        { name: 'firstName', label: t('first_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'lastName', label: t('last_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'dob', label: t('dob'), type: 'date', required: true, section: 'User Information' },
        { name: 'email', label: t('email'), type: 'email', required: true, section: 'User Information' },
        { name: 'password', label: t('password'), type: 'password', required: true, section: 'User Information' },
        { name: 'city', label: t('city'), type: 'text', required: true, section: 'User Information' },
        { name: 'address', label: t('address'), type: 'text', required: true, section: 'User Information' },
        { name: 'postalCode', label: t('postal_code'), type: 'text', required: true, section: 'User Information' },
        { name: 'phoneNumber', label: t('phone_number'), type: 'number', required: true, section: 'User Information' },
    ];

    const otherFields = [
        {
            name: 'locations',
            label: t('Locations'),
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
                />
            ),
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ReusableForm
                fields={[...userFields, ...otherFields]}
                onSubmit={handleSubmit}
                entityName="Location Admin"
                entintyFunction='Add'
            />
        </Box>
    );
};

export default CreateLocationAdmin;

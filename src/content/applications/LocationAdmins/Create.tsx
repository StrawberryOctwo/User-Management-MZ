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

    const locationRef = useRef<any>(null); // Reference to access the location component

    const handleSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        setLoading(true);
        try {
            // Safely access selectedItems if available
            const locationIds = locationRef.current?.selectedItems?.map((location: { id: any }) => location.id) || [];

            const payload = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
                dob: data.dob,
                address: data.address,
                postalCode: data.postalCode,
                phoneNumber: data.phoneNumber,
                locationIds: locationIds, // Include selected location IDs
            };

            // Step 1: Create the entity (replace with the correct service call)
            const response = await addLocationAdmin(payload);

            // Reset form fields and locations after successful submission
            setSelectedLocations([]);
            if (locationRef.current) {
                locationRef.current.reset();
            }

            return response;
        } catch (error: any) {
            console.error("Error adding entity:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };


    // User Data fields
    const userFields: FieldConfig[] = [
        { name: 'firstName', label: t('first_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'lastName', label: t('last_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'dob', label: t('dob'), type: 'date', required: true, section: 'User Information' },
        { name: 'email', label: t('email'), type: 'email', required: true, section: 'User Information' },
        { name: 'password', label: t('password'), type: 'password', required: true, section: 'User Information' },
        { name: 'address', label: t('address'), type: 'text', required: true, section: 'User Information' },
        { name: 'postalCode', label: t('postal_code'), type: 'text', required: true, section: 'User Information' },
        { name: 'phoneNumber', label: t('phone_number'), type: 'text', required: true, section: 'User Information' },
    ];

    // Other Data fields (Locations and any additional info)
    const otherFields = [
        {
            name: 'locations',
            label: 'Locations',
            type: 'custom',
            section: 'Location Admin Assignment',
            component: (
                <MultiSelectWithCheckboxes
                    label={t('Search_and_assign_locations')}
                    fetchData={(query) => fetchLocations(1, 5, query).then((data) => data.data)}
                    onSelect={handleLocationSelect}
                    displayProperty="name"
                    placeholder="Type to search locations"
                    ref={locationRef} // Use ref to access the component's reset function
                />
            ),
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ReusableForm
                fields={[...userFields, ...otherFields]} // Merge both field arrays
                onSubmit={handleSubmit}
                entityName="Location Admin" // Update with the actual entity name
                entintyFunction='Add'
            />
        </Box>
    );
};

export default CreateLocationAdmin;

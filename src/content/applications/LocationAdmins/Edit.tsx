import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';

import { t } from 'i18next';
import { useParams } from 'react-router-dom';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';
import { fetchLocationAdminById, updateLocationAdmin } from 'src/services/locationAdminService';
import { fetchLocations } from 'src/services/locationService';


const EditLocationAdmin = () => {
    const { id } = useParams<{ id: string }>(); // Get the LocationAdmin ID from the URL
    const [locationAdminData, setLocationAdminData] = useState<Record<string, any> | null>(null);
    const [selectedLocations, setSelectedLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const locationRef = useRef<any>(null); // Reference to access the location component

    // Fetch the LocationAdmin data by ID on component mount
    const fetchLocationAdmin = async () => {
        setLoading(true);
        try {
            const fetchedData = await fetchLocationAdminById(Number(id)); // Fetch LocationAdmin by ID

            // Pre-fill form fields with fetched data
            const flattenedData = {
                firstName: fetchedData.firstName,
                lastName: fetchedData.lastName,
                dob: formatDateForInput(fetchedData.dob),
                email: fetchedData.email,
                address: fetchedData.address,
                postalCode: fetchedData.postalCode,
                phoneNumber: fetchedData.phoneNumber,
                password: '', // Keep password blank for editing
            };

            setLocationAdminData(flattenedData);
            setSelectedLocations(fetchedData.locations); // Set selected locations
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
        setLoading(true);
        try {
            const locationIds = locationRef.current?.selectedItems?.map((location: { id: any }) => location.id) || [];

            const payload = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password || undefined, // Only include password if updated
                dob: data.dob,
                address: data.address,
                postalCode: data.postalCode,
                phoneNumber: data.phoneNumber,
                locationIds: locationIds, // Include selected location IDs
            };

            const response = await updateLocationAdmin(Number(id), payload); // Call the service method to update

            // Refetch the updated data after a successful update
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
        return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    };

    // User Data fields
    const userFields: FieldConfig[] = [
        { name: 'firstName', label: t('first_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'lastName', label: t('last_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'dob', label: t('dob'), type: 'date', required: true, section: 'User Information' },
        { name: 'email', label: t('email'), type: 'email', required: true, section: 'User Information' },
        { name: 'password', label: t('password'), type: 'password', required: false, section: 'User Information' }, // Optional in edit mode
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
                    initialValue={selectedLocations} // Pre-fill selected locations
                />
            ),
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!loading && locationAdminData && (
                <ReusableForm
                    fields={[...userFields, ...otherFields]} // Merge both field arrays
                    onSubmit={handleSubmit}
                    initialData={locationAdminData} // Pre-fill form with location admin data
                    entityName="Location Admin" // Update with the actual entity name
                    entintyFunction="Edit"
                />
            )}
        </Box>
    );
};

export default EditLocationAdmin;

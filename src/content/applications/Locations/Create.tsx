import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';

import { t } from 'i18next';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import ReusableForm from 'src/components/Table/tableRowCreate';
import { fetchFranchises } from 'src/services/franchiseService';
import { addLocation } from 'src/services/locationService';

export default function CreateLocation() {
    const [selectedFranchise, setSelectedFranchise] = useState<any>(null); // Store single selected franchise
    const [loading, setLoading] = useState(false); // Unified loading state for both fetching and deleting
    const franchiseRef = useRef<any>(null); // Ref to access the reset method in SingleSelectWithAutocomplete

    const handleFranchiseSelect = (selectedItem: any) => {
        setSelectedFranchise(selectedItem); // Save the selected franchise
    };

    const handleLocationSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        setLoading(true);

        try {
            if (!selectedFranchise) {
                throw new Error('Please select a franchise.');
            }

            const payload = {
                name: data['name'],
                address: data['address'],
                city: data['city'],
                postalCode: data['postalCode'],
                franchiseId: selectedFranchise.id, // Use single franchise ID in the payload
            };

            const response = await addLocation(payload); // Call your API service with the structured payload

            // Reset the form fields and selected franchise
            setSelectedFranchise(null);
            if (franchiseRef.current) {
                franchiseRef.current.reset(); // Reset the franchise autocomplete input
            }
            return response;
        } catch (error: any) {
            console.error("Error adding Location:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const locationFields = [
        { name: 'name', label: t('location_name'), type: 'text', required: true, section: 'Location Information' },
        { name: 'address', label: t('address'), type: 'text', required: true, section: 'Location Information' },
        { name: 'city', label: t('city'), type: 'text', required: true, section: 'Location Information' },
        { name: 'postalCode', label: t('postal_code'), type: 'text', required: true, section: 'Location Information' },
        {
            name: 'franchises',
            label: 'Franchise',
            type: 'custom',
            section: 'Location Assignment',
            component: (
                <SingleSelectWithAutocomplete
                    ref={franchiseRef} // Attach the ref to the SingleSelectWithAutocomplete
                    label={t("Search_and_assign_franchises")}
                    fetchData={(query) => fetchFranchises(1, 5, query).then((data) => data.data)}
                    onSelect={handleFranchiseSelect}
                    displayProperty="name"
                    placeholder="Type to search franchises"
                />
            ),
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ReusableForm
                fields={locationFields}
                onSubmit={handleLocationSubmit}
                entityName="Location"
                entintyFunction="Add"
            />
        </Box>
    );
}

import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';

import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import ReusableForm from 'src/components/Table/tableRowCreate';
import { fetchFranchises } from 'src/services/franchiseService';
import { addLocation } from 'src/services/locationService';
import { useTranslation } from 'react-i18next';

export default function CreateLocation() {
    const [selectedFranchise, setSelectedFranchise] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const franchiseRef = useRef<any>(null);
    const { t } = useTranslation();
    const handleFranchiseSelect = (selectedItem: any) => {
        setSelectedFranchise(selectedItem);
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
                numberOfRooms: data['numberOfRooms'],
                franchiseId: selectedFranchise.id,
            };

            const response = await addLocation(payload);

            setSelectedFranchise(null);
            if (franchiseRef.current) {
                franchiseRef.current.reset();
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
        { name: 'numberOfRooms', label: t('number_of_rooms'), type: 'number', required: true, section: 'Location Information' },
        {
            name: 'franchises',
            label: t('Franchise'),
            type: 'custom',
            section: 'Location Assignment',
            component: (
                <SingleSelectWithAutocomplete
                    ref={franchiseRef}
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

import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';

import { t } from 'i18next';
import { useParams } from 'react-router-dom';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import ReusableForm from 'src/components/Table/tableRowCreate';
import { fetchFranchises } from 'src/services/franchiseService';
import { fetchLocationById, updateLocation } from 'src/services/locationService';

export default function EditLocation() {
    const { id } = useParams<{ id: string }>(); // Get the location ID from the URL
    const [selectedFranchise, setSelectedFranchise] = useState<any>(null); // Store single selected franchise
    const [locationData, setLocationData] = useState<Record<string, any> | null>(null); // State to store location data
    const [loading, setLoading] = useState(false); // Unified loading state for both fetching and saving
    const franchiseRef = useRef<any>(null); // Ref to access the reset method in SingleSelectWithAutocomplete

    // Fetch the location data by ID on component mount
    const fetchLocation = async () => {
        setLoading(true);
        try {
            const fetchedData = await fetchLocationById(Number(id)); // Fetch location by ID

            // Pre-fill the form fields with fetched data
            const flattenedData = {
                name: fetchedData.name,
                address: fetchedData.address,
                city: fetchedData.city,
                postal_code: fetchedData.postal_code,
                numberOfRooms: fetchedData.numberOfRooms,
            };

            setLocationData(flattenedData);
            setSelectedFranchise(fetchedData.franchise); // Set the selected franchise
        } catch (error) {
            console.error('Error fetching Location:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocation();
    }, [id]);

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
                postal_code: data['postal_code'],
                franchiseId: selectedFranchise.id,
                numberOfRooms: data['numberOfRooms'],
            };

            const response = await updateLocation(Number(id), payload);

            // Refetch the location data after successful update
            await fetchLocation();

            return response;
        } catch (error: any) {
            console.error("Error updating Location:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const locationFields = [
        { name: 'name', label: t('location_name'), type: 'text', required: true, section: 'Location Information' },
        { name: 'address', label: t('address'), type: 'text', required: true, section: 'Location Information' },
        { name: 'city', label: t('city'), type: 'text', required: true, section: 'Location Information' },
        { name: 'postal_code', label: t('postal_code'), type: 'text', required: true, section: 'Location Information' },
        { name: 'numberOfRooms', label: t('number_of_rooms'), type: 'number', required: true, section: 'Location Information' },
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
                    initialValue={selectedFranchise} // Pre-fill selected franchise
                />
            ),
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!loading && locationData && (
                <ReusableForm
                    fields={locationFields}
                    onSubmit={handleLocationSubmit}
                    initialData={locationData} // Pre-fill form with location data
                    entityName="Location"
                    entintyFunction="Edit"
                />
            )}
        </Box>
    );
}

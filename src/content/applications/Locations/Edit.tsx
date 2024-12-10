import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import ReusableForm from 'src/components/Table/tableRowCreate';
import { fetchFranchises } from 'src/services/franchiseService';
import { fetchLocationById, updateLocation } from 'src/services/locationService';
import { useTranslation } from 'react-i18next';

export default function EditLocation() {
    const { id } = useParams<{ id: string }>();
    const [selectedFranchise, setSelectedFranchise] = useState<any>(null);
    const [locationData, setLocationData] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(false);
    const franchiseRef = useRef<any>(null);
    const { t } = useTranslation();
    const updateLocalStorageLocation = (updatedLocation: any) => {
        try {
            // Get current selected locations from localStorage
            const storedLocations = localStorage.getItem('selectedLocations');
            const locations = storedLocations ? JSON.parse(storedLocations) : [];

            // Find and update the location in the array
            const updatedLocations = locations.map((loc: any) => {
                if (loc.id === Number(id)) {
                    return {
                        id: loc.id,
                        name: updatedLocation.name,
                        numberOfRooms: updatedLocation.numberOfRooms
                    };
                }
                return loc;
            });

            // {t("(save")} back to localStorage
            localStorage.setItem('selectedLocations', JSON.stringify(updatedLocations));
        } catch (error) {
            console.error('Error updating localStorage:', error);
        }
    };

    const fetchLocation = async () => {
        setLoading(true);
        try {
            const fetchedData = await fetchLocationById(Number(id));

            const flattenedData = {
                name: fetchedData.name,
                address: fetchedData.address,
                city: fetchedData.city,
                postal_code: fetchedData.postal_code,
                numberOfRooms: fetchedData.numberOfRooms,
            };

            setLocationData(flattenedData);
            setSelectedFranchise(fetchedData.franchise);
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
                postal_code: data['postal_code'],
                franchiseId: selectedFranchise.id,
                numberOfRooms: data['numberOfRooms'],
            };

            const response = await updateLocation(Number(id), payload);

            // Update localStorage with the new location data
            updateLocalStorageLocation(payload);

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
            label: t('franchise'),
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
                    initialValue={selectedFranchise}
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
                    initialData={locationData}
                    entityName="Location"
                    entintyFunction="Edit"
                />
            )}
        </Box>
    );
}

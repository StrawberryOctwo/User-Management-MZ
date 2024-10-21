import React, { useState, useEffect, useRef } from 'react';

import Box from '@mui/material/Box';

import { useParams } from 'react-router-dom';
import { t } from 'i18next';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';
import { fetchFranchiseAdminById, updateFranchiseAdmin } from 'src/services/franchiseAdminService';
import { fetchFranchises } from 'src/services/franchiseService';

export default function EditFranchiseAdmin() {
    const { id } = useParams<{ id: string }>(); // Get the franchise admin ID from the URL
    const [adminData, setAdminData] = useState<Record<string, any> | null>(null); // State to store the initial admin data
    const [selectedFranchises, setSelectedFranchises] = useState<any[]>([]); // Store selected franchises
    const dropdownRef = useRef<any>(null); // Ref to access the reset method in MultiSelectWithCheckboxes
    const [loading, setLoading] = useState(false); // Unified loading state

    const formatDateForInput = (date: string) => {
        const d = new Date(date);
        return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    };

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const fetchedData = await fetchFranchiseAdminById(Number(id));

            console.log('Fetched Data:', fetchedData);

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
        setLoading(true);
        try {
            if (selectedFranchises.length === 0) {
                throw new Error('Please select at least one franchise.');
            }

            const franchiseIds = selectedFranchises.map(franchise => franchise.id);

            const payload = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                dob: formatDateForInput(data.dob),
                address: data.address,
                postalCode: data.postalCode,
                phoneNumber: data.phoneNumber,
                franchiseIds, // Include selected franchise IDs
            };

            const response = await updateFranchiseAdmin(Number(id), payload); // Call the API service with the structured payload

            // If update is successful, fetch the updated data again
            await fetchAdminData(); // Refetch the franchise admin data

            if (dropdownRef.current) {
                dropdownRef.current.reset(); // Reset the MultiSelectWithCheckboxes
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
        { name: 'address', label: t('address'), type: 'text', required: true, section: 'User Information' },
        { name: 'postalCode', label: t('postal_code'), type: 'text', required: true, section: 'User Information' },
        { name: 'phoneNumber', label: t('phone_number'), type: 'text', required: true, section: 'User Information' },
    ];

    const otherFields = [
        {
            name: 'franchises',
            label: 'Franchises',
            type: 'custom',
            section: 'Franchise Admin Assignment',
            component: (
                <MultiSelectWithCheckboxes
                    ref={dropdownRef} // Attach the ref to the MultiSelectWithCheckboxes
                    label={t('Search_and_assign_franchises')}
                    fetchData={(query) => fetchFranchises(1, 5, query).then((data) => data.data)}
                    onSelect={handleFranchiseSelect}
                    displayProperty="name"
                    placeholder="Type to search franchises"
                    initialValue={selectedFranchises} // Pre-fill selected franchises
                />
            ),
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!loading && adminData && (
                <ReusableForm
                    fields={[...adminFields, ...otherFields]} // Merge both field arrays
                    onSubmit={handleAdminSubmit}
                    initialData={adminData} // Pre-fill form with admin data
                    entityName="Franchise Admin"
                    entintyFunction="Edit"
                />
            )}
        </Box>
    );
}

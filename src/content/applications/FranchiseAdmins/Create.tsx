import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';

import { t } from 'i18next';
import { addFranchiseAdmin } from 'src/services/franchiseAdminService';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import { fetchFranchises } from 'src/services/franchiseService';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';

export default function CreateFranchiseAdmin() {
    const [selectedFranchises, setSelectedFranchises] = useState<any[]>([]); // State to hold selected franchises
    const dropdownRef = useRef<any>(null); // Ref to access the reset method in MultiSelectWithCheckboxes
    const [loading, setLoading] = useState(false); // Unified loading state for both fetching and deleting

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
                password: data.password,
                dob: data.dob,
                address: data.address,
                postalCode: data.postalCode,
                phoneNumber: data.phoneNumber,
                franchiseIds: franchiseIds, // Include selected franchise IDs
            };

            const response = await addFranchiseAdmin(payload); // Call your API service with the structured payload

            // Reset the form fields and selected franchises
            setSelectedFranchises([]);
            if (dropdownRef.current) {
                dropdownRef.current.reset(); // Reset the MultiSelectWithCheckboxes
            }

            return response;
        }
        catch (error: any) {
            console.error("Error adding Franchise Admin:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const adminFields: FieldConfig[] = [
        { name: 'firstName', label: t('first_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'lastName', label: t('last_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'email', label: t('email'), type: 'email', required: true, section: 'User Information' },
        { name: 'password', label: t('password'), type: 'password', required: true, section: 'User Information' },
        { name: 'dob', label: t('dob'), type: 'date', required: true, section: 'User Information' },
        { name: 'address', label: t('address'), type: 'text', required: true, section: 'User Information' },
        { name: 'postalCode', label: t('postal_code'), type: 'text', required: true, section: 'User Information' },
        { name: 'phoneNumber', label: t('phone_Number'), type: 'text', required: true, section: 'User Information' },
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
                />
            ),
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ReusableForm
                fields={[...adminFields, ...otherFields]} // Merge both field arrays
                onSubmit={handleAdminSubmit}
                entityName="Franchise Admin"
                entintyFunction="Add"
            />
        </Box>
    );
}

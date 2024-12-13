import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import ReusableForm from 'src/components/Table/tableRowCreate';
import { fetchFranchises } from 'src/services/franchiseService';
import { submitBilling } from 'src/services/billingService';
import { useTranslation } from 'react-i18next';

export default function CreateBilling() {
    const [selectedFranchise, setSelectedFranchise] = useState<any>(null); // Store selected franchise
    const [loading, setLoading] = useState(false); // Loading state for submission
    const franchiseRef = useRef<any>(null); // Ref to reset franchise select input
    const { t } = useTranslation();
    const handleFranchiseSelect = (selectedItem: any) => {
        setSelectedFranchise(selectedItem); // Set the selected franchise
    };

    const handleBillingSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        setLoading(true);

        try {
            if (!selectedFranchise) {
                throw new Error('Please select a franchise.');
            }

            const payload = {
                revenue: data['revenue'],
                franchiseId: selectedFranchise.id, // Use selected franchise ID
            };

            const response = await submitBilling(payload); // Call your API service with the payload

            // Reset form fields
            setSelectedFranchise(null);
            if (franchiseRef.current) {
                franchiseRef.current.reset(); // Reset franchise autocomplete
            }
            return response;
        } catch (error: any) {
            console.error("Error submitting Billing:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const billingFields = [
        { name: 'revenue', label: t('revenue'), type: 'number', required: true, section: 'Billing Information' },
        {
            name: 'franchise',
            label: t('franchise'),
            type: 'custom',
            section: 'Franchise Assignment',
            component: (
                <SingleSelectWithAutocomplete
                    ref={franchiseRef} // Attach the ref to reset if needed
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
                fields={billingFields}
                onSubmit={handleBillingSubmit}
                entityName="Billing"
                entintyFunction="Submit"
            />
        </Box>
    );
}

import React, { useState } from 'react';
import { FieldConfig } from 'src/components/Table/tableRowCreate'; // Import FieldConfig type from the correct path
import { Box } from '@mui/material';
import { t } from 'i18next';
import { addFranchise } from 'src/services/franchiseService';
import ReusableForm from 'src/components/Table/tableRowCreate';

// Separate configurations for franchise fields


const CreateFranchise = () => {
    const [loading, setLoading] = useState(false); // Unified loading state for both fetching and deleting

    const handleFranchiseSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        setLoading(true);

        // Structure the data as required by the API
        try {
            const payload = {
                name: data.name,
                ownerName: data.ownerName,
                cardHolderName: data.cardHolderName,
                iban: data.iban,
                bic: data.bic,
                status: data.status,
                totalEmployees: data.totalEmployees,
            };
            const response = await addFranchise(payload);
            return response
        }
        catch (error: any) {
            console.error("Error adding Franchise:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };
    const franchiseFields: FieldConfig[] = [
        { name: 'name', label: t('franchise_name'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'ownerName', label: t('owner_name'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'cardHolderName', label: t('card_holder_name'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'iban', label: t('iban'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'bic', label: t('bic'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'status', label: t('status'), type: 'text', required: true, section: 'Franchise Information' }, // You may want to make this a dropdown for predefined statuses
        { name: 'totalEmployees', label: t('total_employees'), type: 'number', required: true, section: 'Franchise Information' },
    ];
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            <ReusableForm
                fields={franchiseFields} // Use franchise fields array
                onSubmit={handleFranchiseSubmit}
                entityName="Franchise"
                entintyFunction="Add"
            />
        </Box>
    );
};

export default CreateFranchise;

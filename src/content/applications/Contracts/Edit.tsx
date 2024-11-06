import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import { t } from 'i18next';

import { fetchFranchiseById, updateFranchise } from 'src/services/franchiseService';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';

const EditFranchise = () => {
    const { id } = useParams<{ id: string }>(); // Get franchise ID from URL
    const [franchiseData, setFranchiseData] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Fetch franchise data by ID on component mount
    const fetchFranchise = async () => {
        setLoading(true);
        try {
            const fetchedFranchise = await fetchFranchiseById(Number(id)); // Fetch franchise by ID
            setFranchiseData(fetchedFranchise); // Set franchise data to state
        } catch (error) {
            console.error('Error fetching franchise:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFranchise();
    }, [id]);

    const handleFranchiseSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        setSubmitLoading(true);
        try {
            const payload = {
                name: data.name,
                ownerName: data.ownerName,
                cardHolderName: data.cardHolderName,
                iban: data.iban,
                bic: data.bic,
                status: data.status,
                totalEmployees: data.totalEmployees,
                percentage:data.percentage

            };
            const response = await updateFranchise(Number(id), payload); // Update franchise
            return response; // Don't fetch again to prevent re-rendering
        } catch (error: any) {
            console.error('Error updating Franchise:', error);
            throw error;
        } finally {
            setSubmitLoading(false); // Reset submit loading state
        }
    };

    // Define the fields for the form
    const franchiseFields: FieldConfig[] = [
        { name: 'name', label: t('franchise_name'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'ownerName', label: t('owner_name'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'cardHolderName', label: t('card_holder_name'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'iban', label: t('iban'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'bic', label: t('bic'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'status', label: t('status'), type: 'text', required: true, section: 'Franchise Information' }, // Optionally make this a dropdown
        { name: 'totalEmployees', label: t('total_employees'), type: 'number', required: true, section: 'Franchise Information' },
        { name: 'percentage', label: t('percentage'), type: 'number', required: true, section: 'Franchise Information' },

    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!loading && franchiseData && (
                <ReusableForm
                    key={franchiseData.id} // Add key to force re-render when franchiseData changes
                    fields={franchiseFields} // Use franchise fields array
                    onSubmit={handleFranchiseSubmit} // Submit handler for editing
                    initialData={franchiseData} // Pre-fill form with franchise data
                    entityName="Franchise"
                    entintyFunction="Edit"
                />
            )}
        </Box>
    );
};

export default EditFranchise;

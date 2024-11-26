import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import { t } from 'i18next';

import { fetchFranchiseById, updateFranchise } from 'src/services/franchiseService';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';

const EditFranchise = () => {
    const { id } = useParams<{ id: string }>();
    const [franchiseData, setFranchiseData] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    const fetchFranchise = async () => {
        setLoading(true);
        try {
            const fetchedFranchise = await fetchFranchiseById(Number(id));
            setFranchiseData(fetchedFranchise);
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
            // Prepare payload, including handling of logo file if present
            const payload: Record<string, any> = {
                name: data.name,
                ownerName: data.ownerName,
                cardHolderName: data.cardHolderName,
                iban: data.iban,
                bic: data.bic,
                status: data.status,
                totalEmployees: data.totalEmployees,
                percentage: data.percentage,
                city: data.city,
                address: data.address,
                postalCode: data.postalCode,
                emailAddress: data.emailAddress, // New field
                phoneNumber: data.phoneNumber,   // New field
                // Assuming you have a field to handle logo upload
                franchiseLogo: data.franchiseLogo, // New field
            };

            // If franchiseLogo is a File, handle it appropriately (e.g., using FormData)
            let finalPayload: any = payload;
            if (data.franchiseLogo instanceof File) {
                finalPayload = new FormData();
                Object.entries(payload).forEach(([key, value]) => {
                    finalPayload.append(key, value as any);
                });
                finalPayload.append('franchiseLogo', data.franchiseLogo);
            }

            const response = await updateFranchise(Number(id), finalPayload);
            fetchFranchise();
            return response;
        } catch (error: any) {
            console.error('Error updating Franchise:', error);
            throw error;
        } finally {
            setSubmitLoading(false);
        }
    };

    const statusOptions = [
        { label: t('active'), value: 'active' },
        { label: t('inactive'), value: 'inactive' },
        { label: t('interested'), value: 'interested' },
    ];

    const franchiseFields: FieldConfig[] = [
        { name: 'name', label: t('franchise_name'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'ownerName', label: t('owner_name'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'cardHolderName', label: t('card_holder_name'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'iban', label: t('iban'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'bic', label: t('bic'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'status', label: t('status'), type: 'select', required: true, section: 'Franchise Information', options: statusOptions },
        { name: 'totalEmployees', label: t('total_employees'), type: 'number', required: true, section: 'Franchise Information' },
        { name: 'percentage', label: t('percentage'), type: 'number', required: true, section: 'Franchise Information' },
        { name: 'city', label: t('city'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'address', label: t('address'), type: 'text', required: true, section: 'Franchise Information' },
        { name: 'postalCode', label: t('postalCode'), type: 'text', required: true, section: 'Franchise Information' },
        
        // New Fields
        { name: 'franchiseLogo', label: t('franchise_logo'), type: 'logo_file', required: false, section: 'Additional Information' },
        { name: 'emailAddress', label: t('email_address'), type: 'email', required: true, section: 'Contact Information' },
        { name: 'phoneNumber', label: t('phone_number'), type: 'number', required: true, section: 'Contact Information' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!loading && franchiseData && (
                <ReusableForm
                    key={franchiseData.id}
                    fields={franchiseFields}
                    onSubmit={handleFranchiseSubmit}
                    initialData={franchiseData}
                    entityName="Franchise"
                    entintyFunction="Edit"
                />
            )}
        </Box>
    );
};

export default EditFranchise;

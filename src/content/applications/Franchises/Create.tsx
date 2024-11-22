import React, { useState } from 'react';
import { FieldConfig } from 'src/components/Table/tableRowCreate';
import { Box } from '@mui/material';
import { t } from 'i18next';
import { addFranchise } from 'src/services/franchiseService';
import ReusableForm from 'src/components/Table/tableRowCreate';

const CreateFranchise = () => {
    const [loading, setLoading] = useState(false);

    const handleFranchiseSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        setLoading(true);

        try {
            const payload = {
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
        { name: 'franchiseLogo', label: t('franchise_logo'), type: 'logo_file', required: false, section: 'Additional Information' },
        { name: 'emailAddress', label: t('email_address'), type: 'email', required: true, section: 'Contact Information' },
        { name: 'phoneNumber', label: t('phone_number'), type: 'tel', required: true, section: 'Contact Information' },

    ];
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            <ReusableForm
                fields={franchiseFields}
                onSubmit={handleFranchiseSubmit}
                entityName="Franchise"
                entintyFunction="Add"
            />
        </Box>
    );
};

export default CreateFranchise;

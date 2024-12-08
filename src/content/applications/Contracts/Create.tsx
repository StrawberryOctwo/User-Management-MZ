import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import { CircularProgress, Switch, FormControlLabel } from '@mui/material';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import ReusableForm from 'src/components/Table/tableRowCreate';
import { fetchFranchises } from 'src/services/franchiseService';
import { addContractPackage, fetchDiscounts, fetchSessionTypes } from 'src/services/contractPackagesService';
import { useSnackbar } from 'src/contexts/SnackbarContext';
import { useTranslation } from 'react-i18next';

const CreateContract = () => {
    const [selectedFranchise, setSelectedFranchise] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [sessionTypes, setSessionTypes] = useState<any[]>([]);
    const [discounts, setDiscounts] = useState<any[]>([]);
    const [formLoading, setFormLoading] = useState(true);
    const [isVatExempt, setIsVatExempt] = useState(false);
    const [vatPercentage, setVatPercentage] = useState(19);
    const franchiseRef = useRef<any>(null);
    const { showMessage } = useSnackbar();
    const { t } = useTranslation();
    useEffect(() => {
        const loadData = async () => {
            setFormLoading(true);
            try {
                const [sessionTypesData, discountsData] = await Promise.all([
                    fetchSessionTypes(),
                    fetchDiscounts()
                ]);

                // Ensure we're setting arrays, with fallbacks if the API returns unexpected data
                setSessionTypes(Array.isArray(sessionTypesData) ? sessionTypesData : []);
                setDiscounts(Array.isArray(discountsData) ? discountsData : []);
            } catch (error) {
                console.error("Error fetching session types and discounts:", error);
                showMessage('Failed to load form data. Please try again.', 'error');
                // Set empty arrays as fallback
                setSessionTypes([]);
                setDiscounts([]);
            } finally {
                setFormLoading(false);
            }
        };
        loadData();
    }, [showMessage]);

    const handleFranchiseSelect = (selectedItem: any) => {
        setSelectedFranchise(selectedItem);
    };

    const handleContractSubmit = async (data: Record<string, any>) => {
        if (!selectedFranchise) {
            showMessage('Please select a franchise.', 'error');
            return Promise.reject(new Error('Franchise selection required'));
        }

        setLoading(true);
        try {
            // Ensure sessionTypes is an array before mapping
            const sessionTypePrices = Array.isArray(sessionTypes)
                ? sessionTypes.map(type => ({
                    sessionTypeId: type.id,
                    price: Number(data[`sessionPrice_${type.id}`]) || 0,
                }))
                : [];

            // Ensure discounts is an array before mapping
            const discountPrices = Array.isArray(discounts)
                ? discounts.map(discount => ({
                    discountId: discount.id,
                    price: Number(data[`discountPrice_${discount.id}`]) || 0,
                }))
                : [];

            const payload = {
                name: data.name,
                contractName: data.contractName,
                monthlyFee: Number(data.monthlyFee) || 0,
                oneTimeFee: Number(data.oneTimeFee) || 0,
                initialSessionBalance: Number(data.initialSessionBalance) || 0,
                isVatExempt,
                vatPercentage: isVatExempt ? 0 : vatPercentage,
                franchiseId: selectedFranchise.id,
                sessionTypePrices,
                discounts: discountPrices,
            };

            const response = await addContractPackage(payload);

            // Reset form state on success
            setSelectedFranchise(null);
            setIsVatExempt(false);
            setVatPercentage(19);
            if (franchiseRef.current) {
                franchiseRef.current.reset();
            }

            showMessage('Contract package created successfully', 'success');
            return response;
        } catch (error: any) {
            console.error("Error adding contract package:", error);
            showMessage(error.message || 'Failed to create contract package', 'error');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    if (formLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    const contractFields = [
        { name: 'name', label: t('contract_name'), type: 'text', required: true, section: 'Contract Information' },
        { name: 'contractName', label: t('specific_contract_name'), type: 'text', required: true, section: 'Contract Information' },
        { name: 'monthlyFee', label: t('monthly_fee'), type: 'number', required: true, section: 'Contract Information' },
        { name: 'initialSessionBalance', label: t('initial_session_balance'), type: 'number', required: true, section: 'Contract Information' },
        { name: 'oneTimeFee', label: t('one_time_fee'), type: 'number', required: true, section: 'Contract Information' },
        {
            name: 'isVatExempt',
            label: t('vat_exempt'),
            type: 'custom',
            section: 'Contract Information',
            component: (
                <FormControlLabel
                    control={
                        <Switch
                            checked={isVatExempt}
                            onChange={() => {
                                setIsVatExempt(!isVatExempt);
                                if (!isVatExempt) setVatPercentage(19);
                            }}
                        />
                    }
                    label={t('VAT Exempt')}
                />
            ),
        },
        {
            name: 'vatPercentage',
            label: t('vat_percentage'),
            type: 'number',
            required: !isVatExempt,
            initialValue: 19,
            section: 'Contract Information',
            disabled: isVatExempt,
            value: vatPercentage,
            onChange: (e) => setVatPercentage(Number(e.target.value)),
        },
        {
            name: 'franchise',
            label: t('Franchise'),
            type: 'custom',
            section: 'Franchise Assignment',
            component: (
                <SingleSelectWithAutocomplete
                    ref={franchiseRef}
                    label={t("Search_and_assign_franchises")}
                    fetchData={async (query) => {
                        try {
                            const response = await fetchFranchises(1, 5, query);
                            return response.data || [];
                        } catch (error) {
                            console.error('Error fetching franchises:', error);
                            return [];
                        }
                    }}
                    onSelect={handleFranchiseSelect}
                    displayProperty="name"
                    placeholder="Type to search franchises"
                />
            ),
        },
        ...(Array.isArray(sessionTypes) ? sessionTypes : []).map(type => ({
            name: `sessionPrice_${type.id}`,
            label: `${type.name} Price`,
            type: 'number',
            required: true,
            section: 'Session Type Prices',
        })),
        ...(Array.isArray(discounts) ? discounts : []).map(discount => ({
            name: `discountPrice_${discount.id}`,
            label: `${discount.name} Discount Percentage`,
            type: 'number',
            required: false,
            section: 'Discounts',
        })),
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ReusableForm
                fields={contractFields}
                onSubmit={handleContractSubmit}
                entityName="Contract Package"
                entintyFunction="Add"
            // loading={loading}
            />
        </Box>
    );
};

export default CreateContract;

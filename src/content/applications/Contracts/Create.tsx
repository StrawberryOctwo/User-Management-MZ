import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import { t } from 'i18next';
import { CircularProgress, Switch, FormControlLabel } from '@mui/material';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import ReusableForm from 'src/components/Table/tableRowCreate';
import { fetchFranchises } from 'src/services/franchiseService';
import { addContractPackage, fetchDiscounts, fetchSessionTypes } from 'src/services/contractPackagesService';

const CreateContract = () => {
    const [selectedFranchise, setSelectedFranchise] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [sessionTypes, setSessionTypes] = useState<any[]>([]);
    const [discounts, setDiscounts] = useState<any[]>([]);
    const [formLoading, setFormLoading] = useState(true);
    const [isVatExempt, setIsVatExempt] = useState(false);
    const franchiseRef = useRef<any>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const sessionTypesData = await fetchSessionTypes();
                const discountsData = await fetchDiscounts();
                setSessionTypes(sessionTypesData);
                setDiscounts(discountsData);
            } catch (error) {
                console.error("Error fetching session types and discounts:", error);
            } finally {
                setFormLoading(false);
            }
        };
        loadData();
    }, []);

    const handleFranchiseSelect = (selectedItem: any) => {
        setSelectedFranchise(selectedItem);
    };

    const handleContractSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        setLoading(true);
        try {
            if (!selectedFranchise) {
                throw new Error('Please select a franchise.');
            }
            const payload = {
                name: data.name,
                contractName: data.contractName,
                monthlyFee: data.monthlyFee,
                oneTimeFee: data.oneTimeFee,
                isVatExempt,
                vatPercentage: data.vatPercentage,
                franchiseId: selectedFranchise.id,
                sessionTypePrices: sessionTypes.map(type => ({
                    sessionTypeId: type.id,
                    price: data[`sessionPrice_${type.id}`],
                })),
                discounts: discounts.map(discount => ({
                    discountId: discount.id,
                    price: data[`discountPrice_${discount.id}`],
                })),
            };
            const response = await addContractPackage(payload);

            setSelectedFranchise(null);
            setIsVatExempt(false);
            if (franchiseRef.current) {
                franchiseRef.current.reset();
            }
            return response;
        } catch (error: any) {
            console.error("Error adding contract package:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    if (formLoading) return <CircularProgress />;

    const contractFields = [
        { name: 'name', label: t('contract_name'), type: 'text', required: true, section: 'Contract Information' },
        { name: 'contractName', label: t('specific_contract_name'), type: 'text', required: true, section: 'Contract Information' },
        { name: 'monthlyFee', label: t('monthly_fee'), type: 'number', required: true, section: 'Contract Information' },
        { name: 'oneTimeFee', label: t('one_time_fee'), type: 'number', section: 'Contract Information' },
        {
            name: 'isVatExempt',
            label: t('vat_exempt'),
            type: 'custom',
            section: 'Contract Information',
            component: (
                <FormControlLabel
                    control={<Switch checked={isVatExempt} onChange={() => setIsVatExempt(!isVatExempt)} />}
                    label={t('VAT Exempt')}
                />
            ),
        },
        { name: 'vatPercentage', label: t('vat_percentage'), type: 'number', required: true, section: 'Contract Information' },
        {
            name: 'franchise',
            label: 'Franchise',
            type: 'custom',
            section: 'Franchise Assignment',
            component: (
                <SingleSelectWithAutocomplete
                    ref={franchiseRef}
                    label={t("Search_and_assign_franchises")}
                    fetchData={(query) => fetchFranchises(1, 5, query).then((data) => data.data)}
                    onSelect={handleFranchiseSelect}
                    displayProperty="name"
                    placeholder="Type to search franchises"
                />
            ),
        },
        ...sessionTypes.map(type => ({
            name: `sessionPrice_${type.id}`,
            label: `${type.name} Price`,
            type: 'number',
            required: true,
            section: 'Session Type Prices',
        })),
        ...discounts.map(discount => ({
            name: `discountPrice_${discount.id}`,
            label: `${discount.name} Discount Percentage`,
            type: 'number',
            required: true,
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
            />
        </Box>
    );
};

export default CreateContract;

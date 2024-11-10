import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import { t } from 'i18next';
import { CircularProgress, Switch, FormControlLabel, Button } from '@mui/material';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import ReusableForm from 'src/components/Table/tableRowCreate';
import { fetchFranchises } from 'src/services/franchiseService';
import { fetchContractPackageById, editContractPackage, fetchDiscounts, fetchSessionTypes } from 'src/services/contractPackagesService';
import { useParams } from 'react-router-dom';
import { useSnackbar } from 'src/contexts/SnackbarContext';

const EditContract = () => {
    const { id } = useParams(); // Assuming you're using react-router for routing
    const [selectedFranchise, setSelectedFranchise] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [sessionTypes, setSessionTypes] = useState<any[]>([]);
    const [discounts, setDiscounts] = useState<any[]>([]);
    const [formLoading, setFormLoading] = useState(true);
    const [isVatExempt, setIsVatExempt] = useState(false);
    const [vatPercentage, setVatPercentage] = useState(19); // Default VAT value
    const [contractData, setContractData] = useState<any>(null);
    const franchiseRef = useRef<any>(null);
    const { showMessage } = useSnackbar();

    const loadData = async () => {
        try {
            const sessionTypesData = await fetchSessionTypes();
            const discountsData = await fetchDiscounts();
            setSessionTypes(sessionTypesData);
            setDiscounts(discountsData);

            // Fetch the contract data by ID
            const fetchedContractData = await fetchContractPackageById(id);
            setContractData(fetchedContractData);
            setSelectedFranchise(fetchedContractData.franchise);
            setIsVatExempt(fetchedContractData.isVatExempt);
            setVatPercentage(fetchedContractData.vatPercentage || 19); // Set VAT percentage from data or default
        } catch (error) {
            console.error("Error loading contract data:", error);
        } finally {
            setFormLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleFranchiseSelect = (selectedItem: any) => {
        setSelectedFranchise(selectedItem);
    };

    const handleContractSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        if (selectedFranchise === null) {
            showMessage('Please select a franchise.', 'error');
            return;
        }
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
                initialSessionBalance: data.initialSessionBalance,
                isVatExempt,
                vatPercentage: isVatExempt ? 0 : vatPercentage,
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
            const response = await editContractPackage(id, payload);

            loadData();
            return response;
        } catch (error: any) {
            console.error("Error updating contract package:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    if (formLoading) return <CircularProgress />;

    const initialData = {
        name: contractData?.name,
        contractName: contractData?.contractName,
        monthlyFee: contractData?.monthlyFee,
        oneTimeFee: contractData?.oneTimeFee,
        initialSessionBalance: contractData?.initialSessionBalance,
        isVatExempt: contractData?.isVatExempt,
        vatPercentage: contractData?.vatPercentage,
        franchise: selectedFranchise,
        ...sessionTypes.reduce((acc, type) => ({
            ...acc,
            [`sessionPrice_${type.id}`]: contractData?.packageSessionTypePrices?.find(st => st.sessionType.id === type.id)?.price,
        }), {}),
        ...discounts.reduce((acc, discount) => ({
            ...acc,
            [`discountPrice_${discount.id}`]: contractData?.packageDiscountPrices?.find(d => d.discount.id === discount.id)?.price,
        }), {}),
    };

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
                    control={<Switch checked={isVatExempt} onChange={() => { setIsVatExempt(!isVatExempt); if (!isVatExempt) setVatPercentage(19); }} />}
                    label={t('VAT Exempt')}
                />
            ),
        },
        {
            name: 'vatPercentage',
            label: t('vat_percentage'),
            type: 'number',
            required: !isVatExempt, // Required only if not exempt
            section: 'Contract Information',
            disabled: isVatExempt, // Disable if exempt
            defaultValue: vatPercentage,
        },
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
                    initialValue={selectedFranchise}
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
            required: false, // Discounts are optional
            section: 'Discounts',
        })),
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ReusableForm
                fields={contractFields}
                onSubmit={handleContractSubmit}
                entityName="Contract Package"
                entintyFunction="Edit"
                initialData={initialData} // Pass initialData here
            />
        </Box>
    );
};

export default EditContract;

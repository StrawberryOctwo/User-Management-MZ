import { CircularProgress, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ContractCard from 'src/components/Cards';
import { deleteContractPackages, fetchContractPackages } from 'src/services/contractPackagesService';
import { useNavigate } from 'react-router-dom';

export default function ContractPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const { data } = await fetchContractPackages(1, 25); // Example: page 1, limit 25
      setContracts(data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setErrorMessage('Error fetching contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteContractPackages([id])
    loadContracts();
  };

  if (errorMessage) return <div>{errorMessage}</div>;
  if (loading) return <CircularProgress />;

  return (
    <Grid container spacing={4}>
      {contracts.map((contract, contractIndex) => {
        const sessions = contract.packageSessionTypePrices.map((sessionTypePrice: any) => ({
          name: sessionTypePrice.sessionType?.name || 'Unknown',
          price: parseFloat(sessionTypePrice.price),
        }));

        const discounts = contract.packageDiscountPrices.map((discountPrice: any) => ({
          name: discountPrice.discount?.name || 'No Discount',
          percentage: parseFloat(discountPrice.price),
        }));

        return (
          <Grid item xs={12} sm={6} md={4} key={`contract-${contractIndex}`}>
            <ContractCard
              name={contract.name}
              franchiseName={contract.franchise.name}
              sessions={sessions}
              discounts={discounts}
              monthly_fee={parseFloat(contract.monthlyFee)}
              one_time_fee={parseFloat(contract.oneTimeFee)}
              isVatExempt={contract.isVatExempt}
              vat_percentage={parseFloat(contract.vatPercentage)}
              onEdit={() => handleEdit(contract.id)}
              onDelete={() => handleDelete(contract.id)}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

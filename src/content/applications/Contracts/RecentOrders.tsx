import { Box, Button, CircularProgress, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { fetchContracts, fetchSessionTypes, fetchDiscounts } from 'src/services/contractService';
import ContractCard from 'src/components/Cards';

export default function ViewFranchisePage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionTypes, setSessionTypes] = useState<Record<number, { name: string; price: number }>>({});
  const [discounts, setDiscounts] = useState<Record<number, { name: string; percentage: number }>>({});

  useEffect(() => {
    loadContracts();
    loadSessionTypes();
    loadDiscounts();
  }, []);

  const loadContracts = async (searchQuery = '') => {
    setLoading(true);
    try {
      const { data } = await fetchContracts(1, 25, searchQuery);
      setContracts(data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setErrorMessage("Error fetching contracts");
    } finally {
      setLoading(false);
    }
  };

  const loadSessionTypes = async () => {
    try {
      const types = await fetchSessionTypes();
      setSessionTypes(
        types.reduce((acc, session) => {
          acc[session.id] = { name: session.name, price: session.price };
          return acc;
        }, {} as Record<number, { name: string; price: number }>)
      );
    } catch (error) {
      console.error('Error fetching session types:', error);
      setErrorMessage("Error fetching session types");
    }
  };

  const loadDiscounts = async () => {
    try {
      const fetchedDiscounts = await fetchDiscounts();
      setDiscounts(
        fetchedDiscounts.reduce((acc, discount) => {
          acc[discount.id] = { name: discount.name, percentage: discount.price };
          return acc;
        }, {} as Record<number, { name: string; percentage: number }>)
      );
    } catch (error) {
      console.error('Error fetching discounts:', error);
      setErrorMessage("Error fetching discounts");
    }
  };

  if (errorMessage) return <div>{errorMessage}</div>;
  if (loading) return <CircularProgress />;

  return (
    <Grid container spacing={2}>
      {contracts.map((contract, contractIndex) => {
        // Map each session_id in the contract to its session type details (name and price)
        const sessions = contract.session_ids.map((id: number) => {
          const session = sessionTypes[id];
          console.log(`Mapping session ID ${id} to session:`, session); // Log each session mapping
          return session || { name: "Unknown", price: 0 };
        });

        // Map discount_id to discount name and percentage
        const discount = discounts[contract.discount_id] || { name: "No Discount", percentage: 0 };

        return (
          <Grid item xs={12} sm={6} md={4} key={`contract-${contractIndex}`}>
            <ContractCard
              name={contract.name}
              sessions={sessions}
              discount_name={discount.name}
              discount_percentage={discount.percentage}
              monthly_fee={contract.monthly_fee}
              one_time_fee={contract.one_time_fee}
              isVatExempt={contract.isVatExempt}
              vat_percentage={contract.vat_percentage}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

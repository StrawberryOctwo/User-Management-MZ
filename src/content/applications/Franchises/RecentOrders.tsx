import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios
import { Franchise } from 'src/models/FranchiseModel';
import RecentOrdersTable from './RecentOrdersTable';
import { fetchFranchises } from 'src/services/franchiseService';

const ViewFranchisePage: React.FC = () => {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadFranchises = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetchFranchises(1, 4, '');
      setFranchises(response.data);
    } catch (error) {
      console.error('Error fetching franchises:', error);
      setErrorMessage('Failed to load franchises. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFranchises();
  }, []);

  if (loading) return <div>Loading franchises...</div>;
  if (errorMessage) return <div>{errorMessage}</div>;

  return <RecentOrdersTable franchises={franchises} />;
};

export default ViewFranchisePage;

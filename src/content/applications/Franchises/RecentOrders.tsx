// src/pages/ViewFranchisePage.tsx

import React, { useEffect, useState } from 'react';
import ReusableTable from 'src/components/Table';
import { Franchise } from 'src/models/FranchiseModel';
import { fetchFranchises } from 'src/services/franchiseService';

const ViewFranchisePage: React.FC = () => {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadFranchises = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetchFranchises(1, 10, '');
      setFranchises(response?.data || []);
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

  const columns = [
    { field: 'name', headerName: 'Franchise Name' },
    { field: 'ownerName', headerName: 'Owner Name' },
    { field: 'status', headerName: 'Status', render: (value: any) => (value === '1' ? '1' : '0') },
    { field: 'totalEmployees', headerName: 'Total Employees' },
    { field: 'created_at', headerName: 'Created At', render: (value: any) => new Date(value).toLocaleDateString() },
  ];

  const handleEdit = (id: any) => {
    console.log('Edit franchise with ID:', id);
    window.open(`/franchise/edit/${id}`, '_blank');
  };

  const handleDelete = (id: any) => {
    console.log('Delete franchise with ID:', id);
  };

  if (loading) return <div>Loading franchises...</div>;
  if (errorMessage) return <div>{errorMessage}</div>;

  return (
    <ReusableTable
      data={franchises}
      columns={columns}
      title="Franchise List"
      onEdit={handleEdit}
      onView={handleDelete}
    />
  );
};

export default ViewFranchisePage;

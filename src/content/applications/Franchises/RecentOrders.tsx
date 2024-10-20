import { Box, Button, CircularProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ReusableTable from 'src/components/Table';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import { useSnackbar } from 'src/contexts/SnackbarContext';
import { Franchise } from 'src/models/FranchiseModel';
import { deleteFranchise, fetchFranchises } from 'src/services/franchiseService';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export default function ViewFranchisePage() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [totalCount, setTotalCount] = useState(0); // Track total count
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);

  const { showMessage } = useSnackbar();
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    loadFranchises();
  }, [limit, page]);

  const loadFranchises = async (searchQuery = '') => {
    setLoading(true);
    try {
      const { data, total } = await fetchFranchises(page + 1, limit, searchQuery);
      setFranchises([...data]);
      setTotalCount(total);
    } catch (error) {
      showMessage('Failed to load franchises.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Franchise Name' },
    { field: 'ownerName', headerName: 'Owner Name' },
    { field: 'status', headerName: 'Status', render: (value: any) => (value === '1' ? '1' : '0') },
    { field: 'totalEmployees', headerName: 'Total Employees' },
    { field: 'created_at', headerName: 'Created At', render: (value: any) => new Date(value).toLocaleDateString() },
  ];

  const handleEdit = (id: any) => {
    console.log('Edit franchise with ID:', id);
    navigate(`edit/${id}`); // Navigate to the Create Franchise page
  };

  const handleView = (id: any) => {
    console.log('View franchise with ID:', id);
    navigate(`view/${id}`); // Navigate to the Create Franchise page

  };

  const handleDelete = async () => {
    setDialogOpen(false);
    setLoading(true);

    try {
      const response = await deleteFranchise(selectedIds);
      showMessage(response.message, 'success');
      await loadFranchises();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete franchises.';
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (ids: number | number[]) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    setSelectedIds(idsArray);
    setDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(0);
  };

  if (errorMessage) return <div>{errorMessage}</div>;

  return (
    <Box>
      <ReusableTable
        data={franchises}
        columns={columns}
        title="Franchise List"
        onEdit={handleEdit}
        onView={handleView}
        onDelete={confirmDelete}
        onSearchChange={loadFranchises}
        loading={loading}
        error={!!errorMessage}
        page={page}
        limit={limit}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      <ReusableDialog
        open={dialogOpen}
        title="Confirm Deletion"
        onClose={() => setDialogOpen(false)}
        actions={
          <>
            <Button onClick={() => setDialogOpen(false)} color="inherit" disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              color="primary"
              autoFocus
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Confirm'}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete the selected franchise admins?</p>
      </ReusableDialog>
    </Box>
  );
};
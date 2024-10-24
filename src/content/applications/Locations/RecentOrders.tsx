import { Box, Button, CircularProgress } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import ReusableTable from 'src/components/Table';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import { Location } from 'src/models/LocationModel'; // Assuming LocationModel is available
import { fetchLocations, deleteLocation } from 'src/services/locationService';
import { useNavigate } from 'react-router-dom';

export default function ViewLocationPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const isMounted = useRef(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (isMounted.current) {
      loadLocations();
    } else {
      isMounted.current = true;
    }
  }, [limit, page]);

  const loadLocations = async (searchQuery = '') => {
    setLoading(true);
    try {
      const { data, total } = await fetchLocations(page + 1, limit, searchQuery);
      setLocations([...data]);
      setTotalCount(total);
    } catch (error) {
      setErrorMessage('Failed to load locations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Location Name' },
    { field: 'address', headerName: 'Address' },
    { field: 'postalCode', headerName: 'Postal Code' },
    { field: 'franchiseName', headerName: 'Franchise Name' },
    { field: 'totalTeachers', headerName: 'Total Teachers' },
    { field: 'totalStudents', headerName: 'Total Students' },
  ];

  const handleEdit = (id: any) => {
    navigate(`edit/${id}`);
  };

  const handleView = (id: any) => {
    navigate(`view/${id}`);
  };

  const handleDelete = async () => {
    setDialogOpen(false);
    setLoading(true);

    try {
      const response = await deleteLocation(selectedIds);
      await loadLocations();
    } catch (error: any) {
      setErrorMessage('Failed to delete the location(s).');
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
        data={locations}
        columns={columns}
        title="Location List"
        onEdit={handleEdit}
        onView={handleView}
        onDelete={confirmDelete}
        onSearchChange={loadLocations}
        loading={loading}
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
        <p>Are you sure you want to delete the selected locations?</p>
      </ReusableDialog>
    </Box>
  );
}

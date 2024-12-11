import { Box, Button, CircularProgress } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import ReusableTable from 'src/components/Table';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import { deleteLocationAdmins, fetchLocationAdmins } from 'src/services/locationAdminService';
import { useNavigate } from 'react-router-dom';
import { LocationAdmin } from 'src/models/LocationAdminModel';
import { t } from 'i18next';

export default function LocationAdminsContent() {
  const [admins, setAdmins] = useState<LocationAdmin[]>([]);
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
      loadAdmins();
    } else {
      isMounted.current = true;
    }
  }, [limit, page]);

  const loadAdmins = async (searchQuery = '') => {
    setLoading(true);
    try {
      const { data, total } = await fetchLocationAdmins(page + 1, limit, searchQuery);

      const mappedAdmins = data.map((admin: LocationAdmin) => ({
        ...admin,
        fullName: `${admin.firstName} ${admin.lastName}`.trim(),
      }));

      setAdmins(mappedAdmins);
      setTotalCount(total);
    } catch (error) {
      setErrorMessage('Failed to load location admins.');
    } finally {
      setLoading(false);
    }
  };


  const columns = [
    { field: 'fullName', headerName: 'Full Name' },
    /* {
      field: 'dob',
      headerName: 'DOB',
      render: (value: any) => new Date(value).toLocaleDateString()
    }, */
    { field: 'email', headerName: t('email') },
    /* { field: 'address', headerName: 'Address' },
    { field: 'postalCode', headerName: 'Postal Code' }, */
    { field: 'phoneNumber', headerName: t('phone_Number') },
    {
      field: 'locationNames',
      headerName: t('locations'),
      render: (value: any) => {
        if (Array.isArray(value)) {
          return value.map((location: any) => location).join(', ');
        }
        return value; // In case it's not an array, return as is
      }
    },
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
      await deleteLocationAdmins(selectedIds);
      await loadAdmins();
    } catch (error: any) {
      setErrorMessage('Failed to delete location admins.');
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
        data={admins}
        columns={columns}
        title="Location Admins List"
        onEdit={handleEdit}
        onView={handleView}
        onDelete={confirmDelete}
        onSearchChange={loadAdmins}
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
        <p>Are you sure you want to delete the selected location admins?</p>
      </ReusableDialog>
    </Box>
  );
}

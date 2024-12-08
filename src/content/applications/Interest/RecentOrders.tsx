import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Paper,
  Toolbar,
  Button,
  IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReusableTable from 'src/components/Table';
import { fetchInterests } from 'src/services/interestService';
import { useAuth } from 'src/hooks/useAuth';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import DownloadTwoToneIcon from '@mui/icons-material/DownloadTwoTone';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next'

export default function ViewBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(5);
  const { userId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      loadUserBookings();
    }
  }, [userId, page, limit]);

  const loadUserBookings = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, total } = await fetchInterests(page + 1, limit); // Fetch bookings data
      const processedData = data.map((booking: any) => ({
        id: booking.id, // Ensure each row has a unique 'id' field
        ...booking,
        locationName: booking.location?.name || 'N/A',
      }));
      setBookings(processedData);
      setTotalCount(total);
    } catch (error) {
      setErrorMessage('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'firstName', headerName: t('First Name') },
    { field: 'lastName', headerName: t('Last Name') },
    { field: 'email', headerName: t('Email') },
    { field: 'phoneNumber', headerName: t('Phone Number') },
    {
      field: 'appointment',
      headerName: t('Appointment'),
      render: (value: string) => value ? new Date(value).toLocaleString(): 'N/A',
    },
    { field: 'locationName', headerName: t('Location') },
    {
      field: 'accepted',
      headerName: t('Status'),
      render: (value: boolean) => (value ? 'Accepted' : 'Pending'),
    },
  ];

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(0);
  };
  const handleRefresh = () => loadUserBookings();

  // Action Handlers (Implement as needed)
  const handleView = (id: any) => {
    navigate(`view/${id}`);

    console.log('View booking with ID:', id);
  };

  const handleEdit = (id: any) => {
    // Implement edit logic, e.g., open edit dialog
    console.log('Edit booking with ID:', id);
  };

  const handleDelete = (ids: number[]) => {
    // Implement delete logic, e.g., send delete request
    console.log('Delete bookings with IDs:', ids);
  };



  return (
    <Box sx={{ padding: 4 }}>
      {}
      <Paper elevation={3} sx={{ padding: 2, marginBottom: 4 }}>
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingLeft: 0,
            paddingRight: 0,
          }}
        >
          <Typography variant="h6" component="div">
            Bookings List
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Toolbar>
      </Paper>

      {}
      <ReusableTable
        data={bookings}
        columns={columns}
        title="Bookings List"
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        error={!!errorMessage}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        totalCount={totalCount}
        showDefaultActions={true}
      />
    </Box>
  );
}


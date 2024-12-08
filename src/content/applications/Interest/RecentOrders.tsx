import React, { useEffect, useState } from 'react';
import { Box, FormControlLabel, Switch, Typography } from '@mui/material';
import ReusableTable from 'src/components/Table';
import { fetchInterests } from 'src/services/interestService';
import { useAuth } from 'src/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ViewBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByAccepted, setSortByAccepted] = useState<string | null>(null);
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
  }, [userId, page, limit, sortByAccepted, searchQuery]);
  const { t } = useTranslation();
  const loadUserBookings = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, total } = await fetchInterests(
        sortByAccepted,
        page + 1,
        limit,
        searchQuery
      ); // Fetch bookings data
      const processedData = data.map((booking: any) => ({
        id: booking.id, // Ensure each row has a unique 'id' field
        ...booking,
        locationName: booking.location?.name || 'N/A'
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
      render: (value: string) => value ? new Date(value).toLocaleString('de') : 'N/A',
    },
    { field: 'locationName', headerName: t('Location') },
    {
      field: 'accepted',
      headerName: t('Status'),
      render: (value: boolean) => (value ? 'Accepted' : 'Pending')
    }
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

  const handleSortByAcceptedChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSortByAccepted(event.target.checked ? 'desc' : null);
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">{t('Interests Bookings')}</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={sortByAccepted === 'desc'}
              onChange={handleSortByAcceptedChange}
              color="primary"
            />
          }
          label={t('Sort by Accepted')}
        />
      </Box>
      <ReusableTable
        data={bookings}
        columns={columns}
        title="Interests Bookings"
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        error={!!errorMessage}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onSearchChange={(searchQuery: string) => setSearchQuery(searchQuery)}
        totalCount={totalCount}
        showDefaultActions={true}
      />
    </Box>
  );
}

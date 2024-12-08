import { Box, Button, CircularProgress, Switch } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import ReusableTable from 'src/components/Table';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/hooks/useAuth';
import { getParentPayments, getPaymentsForUser } from 'src/services/paymentService';
import PaymentPDF from './PaymentPDF';
import { jsPDF } from 'jspdf';
import generatePDF from './PaymentPDF';
import { useTranslation } from 'react-i18next';

export default function ViewPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const isMounted = useRef(false);
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { userId,userRoles } = useAuth();

  useEffect(() => {
    if (userId) {
      loadPayments();
    } else {
      isMounted.current = true;
    }
  }, [userId, limit, page]);

  const loadPayments = async (searchQuery = '') => {
    if (!userId) {
      console.warn("User ID is null, skipping API call");
      return;
    }

    setLoading(true);
    try {
      const isParent = userRoles.includes('Parent');
      const { data, total } = isParent
        ? await getParentPayments(userId, page + 1, limit)
        : await getPaymentsForUser(userId, page + 1, limit);
      setPayments(data);
      setTotalCount(total);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setErrorMessage('Failed to load payments. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const columns = [
    { field: 'amount', headerName: t('Amount') },
    { field: 'paymentStatus', headerName: t('Payment Status') },
    { field: 'paymentDate', headerName: t('Payment Date'), render: (value: any) => new Date(value).toLocaleDateString('de') },
    { field: 'lastUpdate', headerName: t('Last Update'), render: (value: any) => new Date(value).toLocaleDateString('de') },
  ];

  const handleEdit = (id: any) => {
    navigate(`edit/${id}`);
  };

  const handleView = (id: any) => {
    navigate(`view/${id}`);
  };


  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(0);
  };

  const handleDownload = (payment) => {
    generatePDF(payment);
  };



  if (errorMessage) return <div>{errorMessage}</div>;

  return (
    <Box>
      <ReusableTable
        data={payments}
        columns={columns}
        title="Payments List"
        onEdit={handleEdit}
        onView={handleView}
        onSearchChange={loadPayments}
        onDownload={handleDownload}
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
              // onClick={handleDelete} Uncomment if delete function is implemented
              color="primary"
              autoFocus
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Confirm'}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete the selected payment?</p>
      </ReusableDialog>
    </Box>
  );
};

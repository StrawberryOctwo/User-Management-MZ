import { Box, Button, CircularProgress } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import ReusableTable from 'src/components/Table';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/hooks/useAuth';
import { fetchUserInvoices } from 'src/services/invoiceService';
import ViewInvoiceDetails from 'src/components/Invoices/ViewInvoiceDetails';

export default function ViewInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const { userId } = useAuth();

  useEffect(() => {
    if (userId) {
      loadUserInvoices();
    }
  }, [userId, limit, page]);

  const loadUserInvoices = async () => {
    if (!userId) {
      console.warn("User ID is null, skipping API call");
      return;
    }

    setLoading(true);
    try {
      const { data, total } = await fetchUserInvoices(String(userId), page + 1, limit);
      setInvoices(data);
      setTotalCount(total);
    } catch (error) {
      setErrorMessage('Failed to load invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'invoiceId', headerName: 'Invoice ID' },
    { field: 'totalAmount', headerName: 'Total Amount' },
    { field: 'extraAmount', headerName: 'Extra Amount'},
    { field: 'status', headerName: 'Status' },
    {
      field: 'created_at',
      headerName: 'Created At',
      render: (value: any) => new Date(value).toLocaleString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (value: any, row: any) => (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={() => handleView(row.invoiceId)}
        >
          View Details
        </Button>
      ),
    },
  ];

  const handleView = (invoiceId: any) => {
    setSelectedInvoiceId(invoiceId);
    setIsInvoiceDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(0);
  };

  const closeInvoiceDialog = () => {
    setIsInvoiceDialogOpen(false);
    setSelectedInvoiceId(null);
    loadUserInvoices();
  };

  if (errorMessage) return <div>{errorMessage}</div>;

  return (
    <Box>
      <ReusableTable
        data={invoices}
        columns={columns}
        title="Invoices List"
        onSearchChange={loadUserInvoices}
        loading={loading}
        page={page}
        limit={limit}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        showDefaultActions={false}
      />

      {selectedInvoiceId && (
        <ViewInvoiceDetails
          isOpen={isInvoiceDialogOpen}
          invoiceId={selectedInvoiceId}
          userId={String(userId)}
          onClose={closeInvoiceDialog}
        />
      )}
    </Box>
  );
}

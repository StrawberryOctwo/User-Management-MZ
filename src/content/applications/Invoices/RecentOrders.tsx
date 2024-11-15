import React, { useEffect, useRef, useState } from 'react';
import { Box, Button } from '@mui/material';
import ReusableTable from 'src/components/Table';
import { fetchInvoiceById, fetchUserInvoices } from 'src/services/invoiceService';
import { useAuth } from 'src/hooks/useAuth';
import ViewInvoiceDetails from 'src/components/Invoices/ViewInvoiceDetails';
import generateTeacherInvoicePDF from './teacherInvoice';
import { fetchTeacherById, fetchTeacherByUserId } from 'src/services/teacherService';
import generateParentInvoicePDF from './parentInvoice';

export default function ViewInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const { userId,userRoles } = useAuth();
  const isMounted = useRef(false); // Check if component is mounted

  // Handle component mount and unmount
  useEffect(() => {
    if (userId) {
      loadUserInvoices();
    }
    else {
      isMounted.current = true;
    }

 
  }, [userId, page, limit]);

  const loadUserInvoices = async () => {
    if (!isMounted.current) return; // Prevent action if unmounted
    setLoading(true);

    try {
      const { data, total } = await fetchUserInvoices(userId, page + 1, limit);
      if (isMounted.current) {
        setInvoices(data);
        setTotalCount(total);
      }
    } catch (error) {
      if (isMounted.current) {
        setErrorMessage('Failed to load invoices. Please try again.');
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoiceId: number) => {
    try {
      const invoiceData = await fetchInvoiceById(invoiceId, userId);
      if (userRoles.includes('Parent')) {
        if (isMounted.current) generateParentInvoicePDF(invoiceData,true);
      } else {
        // Fetch additional teacher data if not a parent
        const teacherData = await fetchTeacherByUserId(userId);
        if (isMounted.current) generateTeacherInvoicePDF(invoiceData, teacherData,true);
      }  } catch (error) {
      console.error('Error generating invoice PDF:', error);
    }
  };

  const columns = [
    { field: 'invoiceId', headerName: 'Invoice ID' },
    { field: 'totalAmount', headerName: 'Total Amount' },
    { field: 'status', headerName: 'Status' },
    {
      field: 'createdAt',
      headerName: 'Created At',
      render: (value: any) => new Date(value).toLocaleString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (value: any, row: any) => (
        <div>

          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={() => handleDownloadPDF(row.id)}
          >
            Download PDF
          </Button>
        </div>
      ),
    },
  ];



  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(0);
  };



  if (errorMessage) return <div>{errorMessage}</div>;

  return (
    <Box>
      <ReusableTable
        data={invoices}
        columns={columns}
        title="Invoices List"
        loading={loading}
        page={page}
        limit={limit}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        showDefaultActions={false}
      />

  
    </Box>
  );
}

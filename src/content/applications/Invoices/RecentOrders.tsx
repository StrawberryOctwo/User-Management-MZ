// src/components/ViewInvoices.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  TextField, // Needed for DatePicker renderInput
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ReusableTable from 'src/components/Table';
import {
  fetchInvoiceById,
  fetchUserInvoices,
  fetchDailyInvoicesForFranchise,
} from 'src/services/invoiceService';
import { useAuth } from 'src/hooks/useAuth';
import ViewInvoiceDetails from 'src/components/Invoices/ViewInvoiceDetails';
import { fetchTeacherInvoiceInfoByUserId } from 'src/services/teacherService';
import { Visibility, Download, GetApp } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import generateParentInvoicePDF from './parentInvoice';
import generateTeacherInvoicePDF from './teacherInvoice';
import { generateBulkInvoicesZip } from './bulkGenerateInvoices';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

export default function ViewInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const [bulkLoading, setBulkLoading] = useState(false);

  // New state for DatePicker
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // New state for showing messages
  const [message, setMessage] = useState<{
    text: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  const { userId, userRoles } = useAuth();
  const isMounted = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    isMounted.current = true;
    if (userId) {
      loadUserInvoices();
    }

    return () => {
      isMounted.current = false;
    };
  }, [userId, page, limit]);

  const loadUserInvoices = async () => {
    if (!isMounted.current) return;
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

  // New function to show messages
  const showMessage = (
    text: string,
    severity: 'success' | 'error' | 'info' | 'warning'
  ) => {
    setMessage({ text, severity });
  };

  const handlePreviewPDF = async (invoiceId: number, invoiceUserId: number) => {
    try {
      let fetchingUserId = userRoles.includes('FranchiseAdmin')
        ? invoiceUserId
        : userId;
      const invoiceData = await fetchInvoiceById(invoiceId, fetchingUserId);
      if (userRoles.includes('Parent')) {
        if (isMounted.current)
          generateParentInvoicePDF(invoiceData, true);
      } else if (userRoles.includes('Teacher')) {
        const teacherData = await fetchTeacherInvoiceInfoByUserId(
          fetchingUserId
        );
        if (isMounted.current)
          generateTeacherInvoicePDF(invoiceData, teacherData, true);
      } else if (userRoles.includes('FranchiseAdmin')) {
        if (invoiceData.student) {
          console.log(invoiceData);
          if (isMounted.current)
            generateParentInvoicePDF(invoiceData, true);
        } else {
          const teacherData = await fetchTeacherInvoiceInfoByUserId(
            fetchingUserId
          );
          if (isMounted.current)
            generateTeacherInvoicePDF(invoiceData, teacherData, true);
        }
      }
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      showMessage('Error generating invoice PDF.', 'error');
    }
  };

  const handleDownloadPDF = async (invoiceId: number, invoiceUserId: number) => {
    try {
      let fetchingUserId = userRoles.includes('FranchiseAdmin')
        ? invoiceUserId
        : userId;
      const invoiceData = await fetchInvoiceById(invoiceId, fetchingUserId);
      if (userRoles.includes('Parent')) {
        if (isMounted.current)
          generateParentInvoicePDF(invoiceData, false);
      } else if (userRoles.includes('Teacher')) {
        const teacherData = await fetchTeacherInvoiceInfoByUserId(
          fetchingUserId
        );
        if (isMounted.current)
          generateTeacherInvoicePDF(invoiceData, teacherData, false);
      } else if (userRoles.includes('FranchiseAdmin')) {
        if (invoiceData.student) {
          console.log(invoiceData);
          if (isMounted.current)
            generateParentInvoicePDF(invoiceData, false);
        } else {
          const teacherData = await fetchTeacherInvoiceInfoByUserId(
            fetchingUserId
          );
          if (isMounted.current)
            generateTeacherInvoicePDF(invoiceData, teacherData, false);
        }
      }
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      showMessage('Error generating invoice PDF.', 'error');
    }
  };

  /**
   * Handles the bulk download of all invoices for a specific date.
   */
  const handleBulkDownload = async () => {
    if (!selectedDate) {
      showMessage('Please select a date to download invoices.', 'warning');
      return;
    }

    try {
      setBulkLoading(true);

      const formattedDate = dayjs(selectedDate).format('DD-MM-YYYY');
      const { data: dailyInvoices } = await fetchDailyInvoicesForFranchise(
        formattedDate
      );

      if (dailyInvoices.length === 0) {
        showMessage('No invoices found for the selected date.', 'info');
        setBulkLoading(false);
        return;
      }

      const zipBlob = await generateBulkInvoicesZip(dailyInvoices);
      saveAs(zipBlob, `invoices_bulk_${formattedDate}.zip`);
      showMessage('Bulk invoices downloaded successfully!', 'success');
    } catch (error: any) {
      console.error('Error downloading bulk invoices:', error);
      showMessage(error.message || 'Failed to download bulk invoices.', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  const columns = [
    { field: 'invoiceId', headerName: t('Invoice ID') },
    {
      field: 'firstName',
      headerName: t('First Name'),
      render: (value: any, row: any) => row.user.firstName,
    },
    {
      field: 'lastName',
      headerName: t('Last Name'),
      render: (value: any, row: any) => row.user.lastName,
    },
    { field: 'totalAmount', headerName: t('Total Amount') },
    { field: 'status', headerName: t('Status') },
    {
      field: 'createdAt',
      headerName: t('Created At'),
      render: (value: any) => new Date(value).toLocaleString('de-DE'),
    },
    {
      field: 'actions',
      headerName: t('Actions'),
      render: (value: any, row: any) => (
        <div>
          {/* View PDF Icon Button */}
          <Tooltip title="View Invoice">
            <IconButton
              color="secondary"
              size="small"
              onClick={() => handlePreviewPDF(row.id, row.user.id)}
            >
              <Visibility />
            </IconButton>
          </Tooltip>

          {/* Conditionally Render Download PDF Icon Button for FranchiseAdmin */}
          {userRoles.includes('FranchiseAdmin') && (
            <Tooltip title="Download Sepa & Invoice">
              <IconButton
                color="primary"
                size="small"
                onClick={() => handleDownloadPDF(row.id, row.user.id)}
              >
                <Download />
              </IconButton>
            </Tooltip>
          )}
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
    // Wrap with LocalizationProvider for DatePicker
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {userRoles.includes('FranchiseAdmin') && (
          <Box mb={2}>
            {/* Date Picker for selecting invoice date */}
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              renderInput={(params) => (
                <TextField {...params} fullWidth margin="normal" />
              )}
            />

            {/* Bulk Download Button */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<GetApp />}
              onClick={handleBulkDownload}
              disabled={bulkLoading}
              fullWidth
            >
              {bulkLoading ? <CircularProgress size={24} /> : 'Bulk Download Invoices'}
            </Button>
          </Box>
        )}

        {/* Snackbar for showing messages */}
        <Snackbar
          open={!!message}
          autoHideDuration={6000}
          onClose={() => setMessage(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          {message && (
            <Alert
              onClose={() => setMessage(null)}
              severity={message.severity}
              sx={{ width: '100%' }}
            >
              {message.text}
            </Alert>
          )}
        </Snackbar>

        {/* Reusable Table for displaying invoices */}
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
    </LocalizationProvider>
  );
}

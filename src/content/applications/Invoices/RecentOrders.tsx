import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import ReusableTable from 'src/components/Table';
import { fetchInvoiceById, fetchUserInvoices } from 'src/services/invoiceService';
import { useAuth } from 'src/hooks/useAuth';
import ViewInvoiceDetails from 'src/components/Invoices/ViewInvoiceDetails';
import generateTeacherInvoicePDF from './teacherInvoice';
import { fetchTeacherById, fetchTeacherByUserId, fetchTeacherInvoiceInfoByUserId } from 'src/services/teacherService';
import generateParentInvoicePDF from './parentInvoice';
import { Visibility, Download } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function ViewInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const { userId, userRoles } = useAuth();
  const isMounted = useRef(false); // Check if component is mounted
  const { t } = useTranslation();
  // Handle component mount and unmount
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

  const handlePreviewPDF = async (invoiceId: number, invoiceUserId: number) => {
    try {
      let fetchingUserId = userRoles.includes('FranchiseAdmin') ? invoiceUserId : userId;
      const invoiceData = await fetchInvoiceById(invoiceId, fetchingUserId);
      if (userRoles.includes('Parent')) {
        if (isMounted.current) generateParentInvoicePDF(invoiceData, true);
      } else if (userRoles.includes('Teacher')) {
        const teacherData = await fetchTeacherInvoiceInfoByUserId(fetchingUserId);
        if (isMounted.current) generateTeacherInvoicePDF(invoiceData, teacherData, true);
      } else if (userRoles.includes('FranchiseAdmin')) {
        if (invoiceData.student) {
          console.log(invoiceData);
          if (isMounted.current) generateParentInvoicePDF(invoiceData, true);
        } else {
          const teacherData = await fetchTeacherInvoiceInfoByUserId(fetchingUserId);
          if (isMounted.current) generateTeacherInvoicePDF(invoiceData, teacherData, true);
        }
      }
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
    }
  };
  const handleDownloadPDF = async (invoiceId: number, invoiceUserId: number) => {
    try {
      let fetchingUserId = userRoles.includes('FranchiseAdmin') ? invoiceUserId : userId;
      const invoiceData = await fetchInvoiceById(invoiceId, fetchingUserId);
      if (userRoles.includes('Parent')) {
        if (isMounted.current) generateParentInvoicePDF(invoiceData, true);
      } else if (userRoles.includes('Teacher')) {
        const teacherData = await fetchTeacherInvoiceInfoByUserId(fetchingUserId);
        if (isMounted.current) generateTeacherInvoicePDF(invoiceData, teacherData, true);
      } else if (userRoles.includes('FranchiseAdmin')) {
        if (invoiceData.student) {
          console.log(invoiceData);
          if (isMounted.current) generateParentInvoicePDF(invoiceData, false);
        } else {
          const teacherData = await fetchTeacherInvoiceInfoByUserId(fetchingUserId);
          if (isMounted.current) generateTeacherInvoicePDF(invoiceData, teacherData, false);
        }
      }
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
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
      render: (value: any) => new Date(value).toLocaleString(),
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

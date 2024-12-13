import { Box, Button, CircularProgress, Switch } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import ReusableTable from 'src/components/Table';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import { useAuth } from 'src/hooks/useAuth';
import { fetchParentSessionReports } from 'src/services/parentService';
import ViewSessionReportForm from 'src/components/Calendar/Components/Modals/ViewSessionReport';
import { useTranslation } from 'react-i18next';

export default function ViewSessionReports() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const isMounted = useRef(false);

  const { userId } = useAuth();
  const { t } = useTranslation();
  useEffect(() => {
    if (userId) {
      loadSessionReports();
    } else {
      isMounted.current = true;
    }
  }, [userId, limit, page]);

  const loadSessionReports = async (searchQuery = '') => {
    if (!userId) {
      console.warn('User ID is null, skipping API call');
      return;
    }

    setLoading(true);
    try {
      const { data, total } = await fetchParentSessionReports(
        userId,
        page + 1,
        limit
      );
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
    { field: 'studentName', headerName: 'Name' },
    {
      field: 'sessionStartDate',
      headerName: t('Session Start Date'),
      render: (value: any) => formatDateTime(value)
    },
    {
      field: 'sessionEndDate',
      headerName: t('Session End Date'),
      render: (value: any) => formatDateTime(value)
    },
    {
      field: 'reportDate',
      headerName: t('Report Date'),
      render: (value: any) => formatDateTime(value)
    },
    { field: 'lessonTopic', headerName: t('lesson_topic') },
    {
      field: 'actions',
      headerName: t('{t("actions")}'),
      render: (value: any, row: any) => (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={() => handleView(row.id)}
        >
          View Report
        </Button>
      )
    }
  ];

  const formatDateTime = (date: string | Date): string => {
    const parsedDate = new Date(date);
    return `${parsedDate.toLocaleDateString('de', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })} - ${parsedDate.toLocaleTimeString('de', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })}`;
  };

  const handleEdit = (id: any) => {
    openReportDialog(id);
  };

  const openReportDialog = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsReportDialogOpen(true);
  };

  const handleView = (id: any) => {
    openReportDialog(id);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(0);
  };

  const closeReportDialog = () => {
    setIsReportDialogOpen(false);
    setSelectedReportId(null);
  };

  if (errorMessage) return <div>{errorMessage}</div>;

  return (
    <Box>
      <ReusableTable
        data={payments}
        columns={columns}
        title="Session Reports List"
        onSearchChange={loadSessionReports}
        loading={loading}
        page={page}
        limit={limit}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        showDefaultActions={false}
      />

      <ReusableDialog
        open={dialogOpen}
        title="Confirm Deletion"
        onClose={() => setDialogOpen(false)}
        actions={
          <>
            <Button
              onClick={() => setDialogOpen(false)}
              color="inherit"
              disabled={loading}
            >
              {t("cancel")}
            </Button>
            <Button
              // onClick={handleDelete} Uncomment if delete function is implemented
              color="primary"
              autoFocus
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t("confirm")}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete the selected payment?</p>
      </ReusableDialog>

      {selectedReportId && (
        <ViewSessionReportForm
          isOpen={isReportDialogOpen}
          reportId={selectedReportId}
          onClose={closeReportDialog}
          onDelete={closeReportDialog}
          isEditable={false}
        />
      )}
    </Box>
  );
}

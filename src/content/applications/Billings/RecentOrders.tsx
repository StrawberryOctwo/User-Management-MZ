import { Box, Button, CircularProgress, Switch } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import ReusableTable from 'src/components/Table';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import { useNavigate } from 'react-router-dom';
import { confirmBillingAsPaid, fetchAllBillings } from 'src/services/billingService';
import { useTranslation } from 'react-i18next';


export default function ViewBillingsPage() {
  const [billings, setBillings] = useState<any[]>([]);
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

  useEffect(() => {
    if (isMounted.current) {
      loadBillings();
    } else {
      isMounted.current = true;
    }
  }, [limit, page]);

  const loadBillings = async (searchQuery = '') => {
    setLoading(true);
    try {
      const { data, total } = await fetchAllBillings(page + 1, limit, searchQuery);
      setBillings([...data]);
      setTotalCount(total);
    } catch (error) {
      console.error('Error fetching billings:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'revenue', headerName: t('tevenue') },
    { field: 'amountDue', headerName: t('amount_due') },
    { field: 'billingDate', headerName: t('billing_date'), render: (value: any) => new Date(value).toLocaleDateString() },
    {
      field: 'franchiseName',
      headerName: t('franchise_name'),
      render: (value: any, row: any) => row.franchise?.name || 'N/A',
    },
    {
      field: 'isPaid',
      headerName: t('paid'),
      render: (value: any, row: any) => (
        <Switch
          checked={row.isPaid}
          onChange={(event) => handleTogglePaid(row.id, event.target.checked)}
          color="success"
        />
      ),
    },
  ];

  const handleEdit = (id: any) => {
    navigate(`edit/${id}`);
  };

  const handleView = (id: any) => {
    navigate(`view/${id}`);

  };

  const handleTogglePaid = async (id: number, checked: boolean) => {
    try {
      await confirmBillingAsPaid(id, checked);

      setBillings((prevBillings) =>
        prevBillings.map((billing) =>
          billing.id === id ? { ...billing, isPaid: checked } : billing
        )
      );
    } catch (error) {
      console.error('Failed to update billing status', error);
    }
  };


  // const handleDelete = async () => {
  //   setDialogOpen(false);
  //   setLoading(true);

  //   try {
  //     const response = await deleteBilling(selectedIds);
  //     await loadBillings();
  //   } catch (error: any) {
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const confirmDelete = (ids: number | number[]) => {
  //   const idsArray = Array.isArray(ids) ? ids : [ids];
  //   setSelectedIds(idsArray);
  //   setDialogOpen(true);
  // };

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
        data={billings}
        columns={columns}
        title={t("billings_list")}
        onEdit={handleEdit}
        onView={handleView}
        // onDelete={confirmDelete}
        onSearchChange={loadBillings}
        loading={loading}
        page={page}
        limit={limit}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      <ReusableDialog
        open={dialogOpen}
        title={t("confirm_deletion")}
        onClose={() => setDialogOpen(false)}
        actions={
          <>
            <Button onClick={() => setDialogOpen(false)} color="inherit" disabled={loading}>
              {t("(cancel")}
            </Button>
            <Button
              // onClick={handleDelete}
              color="primary"
              autoFocus
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t("confirm")}
            </Button>
          </>
        }
      >
        <p>{t("are_you_sure_you_want_to_delete_the_selected_billing?")}</p>
      </ReusableDialog>
    </Box>
  );
};

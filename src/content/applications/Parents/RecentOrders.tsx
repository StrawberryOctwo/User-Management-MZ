import { Box, Button, CircularProgress } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import ReusableTable from 'src/components/Table';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import { fetchParents, deleteParents } from 'src/services/parentService';
import { useNavigate } from 'react-router-dom';
import { t } from "i18next"

export default function ParentsContent() {
  const [parents, setParents] = useState([]);
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
      loadParents();
    } else {
      isMounted.current = true;
    }
  }, [limit, page]);

  const loadParents = async (searchQuery = '') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, total } = await fetchParents(page + 1, limit, searchQuery);

      const mappedParents = data.map((parent: any) => ({
        id: parent.id,
        fullName: `${parent.user.firstName} ${parent.user.lastName}`.trim(),
        email: parent.user.email,
        address: parent.user.address,
      }));

      setParents(mappedParents);
      setTotalCount(total);
    } catch (error: any) {
      setErrorMessage('Failed to load parents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'fullName', headerName: t('Full Name') },
    { field: 'email', headerName: t('email') },
    { field: 'address', headerName: t('address') },
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
      await deleteParents(selectedIds);
      await loadParents();
    } catch (error: any) {
      setErrorMessage('Failed to delete parents.');
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
        data={parents}
        columns={columns}
        title="Parent List"
        onEdit={handleEdit}
        onView={handleView}
        onDelete={confirmDelete}
        onSearchChange={loadParents}
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
              {t("cancel")}
            </Button>
            <Button
              onClick={handleDelete}
              color="primary"
              autoFocus
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t("confirm")}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete the selected parents?</p>
      </ReusableDialog>
    </Box>
  );
}

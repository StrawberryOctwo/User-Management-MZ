import { Box, Button, CircularProgress } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import FileActions from 'src/components/Files/FileActions';
import ReusableTable from 'src/components/Table';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import { fetchSelfFiles, deleteFiles } from 'src/services/fileUploadService';


export default function FileUploadContent() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
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
      loadFiles();
    } else {
      isMounted.current = true;
    }
  }, [limit, page]);

  const loadFiles = async (searchQuery = '') => {
    setLoading(true);
    try {
      const { data, total } = await fetchSelfFiles(
        page + 1,
        limit,
        searchQuery
      );
      setFiles([...data]);
      setTotalCount(total);
    } catch (error) {
      console.error('Failed to load files.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'name', headerName: t('file_name') },
    { field: 'type', headerName: t('file_type') },
    {
      field: 'user',
      headerName: t('uploaded_by'),
      render: (value, row) => `${row.user?.firstName || ''} ${row.user?.lastName || ''}`
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      render: (value) => new Date(value).toLocaleDateString('de')
    },
    {
      field: 'actions',
      headerName: 'File {t("actions")}',
      render: (value, row) => <FileActions fileId={row.id} fileName={row.name} /> // Use FileActions here
    }
  ];

  const handleDelete = async () => {
    setDialogOpen(false);
    setLoading(true);

    try {
      await deleteFiles(selectedIds);
      await loadFiles();
    } catch (error: any) {
      console.error('Failed to delete files.');
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

  return (
    <Box>
      <ReusableTable
        data={files}
        columns={columns}
        title={t("files_list")}
        onDelete={confirmDelete}
        onSearchChange={loadFiles}
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
            <Button onClick={handleDelete} color="primary" autoFocus disabled={loading}>
              {loading ? <CircularProgress size={24} /> : t("confirm")}
            </Button>
          </>
        }
      >
        <p>{t("are_you_sure_you_want_to_delete_the_selected_files?")}</p>
      </ReusableDialog>
    </Box>
  );
}

import { Box, Button, CircularProgress } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import ReusableTable from 'src/components/Table';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import { fetchFiles, deleteFiles } from 'src/services/fileUploadService';

export default function FileUploadContent() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const isMounted = useRef(false);

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
      const { data, total } = await fetchFiles(page + 1, limit, searchQuery);
      setFiles([...data]);
      setTotalCount(total);
    } catch (error) {
      console.error('Failed to load files.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'name', headerName: 'File Name' },
    { field: 'type', headerName: 'File Type' },
    {
      field: 'user',
      headerName: 'Uploaded By',
      render: (rowData: any) => {
        // Directly access firstName and lastName from rowData
        const { firstName, lastName } = rowData;
        if (firstName && lastName) {
          return `${firstName} ${lastName}`;
        }
        return 'Unknown User';
      }
    },
    {
      field: 'created_at',
      headerName: 'Created At',
      render: (value: any) => new Date(value).toLocaleDateString()
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
        title="Files List"
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
        title="Confirm Deletion"
        onClose={() => setDialogOpen(false)}
        actions={
          <>
            <Button onClick={() => setDialogOpen(false)} color="inherit" disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleDelete} color="primary" autoFocus disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Confirm'}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete the selected files?</p>
      </ReusableDialog>
    </Box>
  );
}

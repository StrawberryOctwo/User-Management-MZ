import { Box, Button, CircularProgress } from '@mui/material';
import React, { useEffect, useState, useRef } from 'react';
import ReusableTable from 'src/components/Table';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import { fetchStudents, deleteStudent } from 'src/services/studentService';
import { useNavigate } from 'react-router-dom';

export default function StudentsContent() {
  const [students, setStudents] = useState([]);
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
      loadStudents();
    } else {
      isMounted.current = true;
    }
  }, [page, limit]);

  const loadStudents = async (searchQuery = '') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, total } = await fetchStudents(page + 1, limit, searchQuery);

      if (isMounted.current) {
        // Merge firstName and lastName into fullName
        const mergedData = data.map((student: any) => ({
          ...student,
          fullName: `${student.firstName} ${student.lastName}`.trim(),
        }));

        setStudents(mergedData);
        setTotalCount(total);
      }
    } catch (error: any) {
      if (isMounted.current) {
        if (error.response?.data?.message.includes('TokenExpiredError')) {
          // Handle token expiration
        } else {
          setErrorMessage('Failed to load students. Please try again.');
        }
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };


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
      await deleteStudent(selectedIds);
      await loadStudents();
    } catch (error: any) {
      if (isMounted.current) setErrorMessage('Failed to delete students.');
    } finally {
      if (isMounted.current) setLoading(false);
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
        data={students}
        columns={[
          { field: 'fullName', headerName: 'Full Name' },
          { field: 'email', headerName: 'Email' },
          { field: 'gradeLevel', headerName: 'Grade Level' },
          { field: 'status', headerName: 'Status' },
          { field: 'payPerHour', headerName: 'Pay Per Hour' },
        ]}
        title="Student List"
        onEdit={handleEdit}
        onView={handleView}
        onDelete={confirmDelete}
        onSearchChange={loadStudents}
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
              onClick={handleDelete}
              color="primary"
              autoFocus
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Confirm'}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete the selected students?</p>
      </ReusableDialog>
    </Box>
  );
}

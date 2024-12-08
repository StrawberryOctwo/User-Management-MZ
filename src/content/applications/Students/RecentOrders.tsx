import { Box, Button, CircularProgress } from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import ReusableTable from 'src/components/Table';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import {
  fetchStudents,
  deleteStudent,
  fetchParentStudents
} from 'src/services/studentService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/hooks/useAuth';
import { t } from 'i18next';
import { CompareSharp } from '@mui/icons-material';

export default function StudentsContent() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]); // State for userRoles

  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const { userRoles: authUserRoles, loading: authLoading } = useAuth();

  const navigate = useNavigate();

  // First useEffect: Set userRoles from authUserRoles
  useEffect(() => {
    if (!authLoading && authUserRoles && userRoles.length === 0) {
      setUserRoles(authUserRoles);
    }
  }, [authLoading, authUserRoles, userRoles.length]);

  // Memoize loadStudents to prevent unnecessary re-creations
  const loadStudents = useCallback(
    async (searchQuery = '') => {
      setLoading(true);
      setErrorMessage(null);

      try {
        let result;
        if (userRoles.length === 0) {
          return;
        }
        if (userRoles.includes('Parent')) {
          result = await fetchParentStudents(page + 1, limit, searchQuery);
        } else {
          result = await fetchStudents(page + 1, limit, searchQuery);
        }

        const { data, total } = result;
        const mergedData = data.map((student: any) => ({
          ...student,
          fullName: `${student.firstName} ${student.lastName}`.trim()
        }));

        setStudents(mergedData);
        setTotalCount(total);
      } catch (error: any) {
        setErrorMessage('Failed to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [userRoles, page, limit]
  );

  // Second useEffect: Fetch students when userRoles, page, or limit change
  useEffect(() => {
    if (userRoles.length > 0) {
      loadStudents();
    }
  }, [userRoles, page, limit, loadStudents]);

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
      setErrorMessage('Failed to delete students.');
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

  const hasAdminPrivileges = userRoles.some((role) =>
    ['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin'].includes(role)
  );

  if (errorMessage) return <div>{errorMessage}</div>;

  return (
    <Box>
      <ReusableTable
        data={students}
        columns={[
          { field: 'fullName', headerName: t('Full Name') },
          { field: 'email', headerName: t('Email') },
          { field: 'gradeLevel', headerName: t('Grade Level') },
          { field: 'contractName', headerName: t('Contract') },
          { field: 'status', headerName: t('Status') }
        ]}
        title="Student List"
        onEdit={hasAdminPrivileges ? handleEdit : undefined}
        onView={handleView}
        onDelete={hasAdminPrivileges ? confirmDelete : undefined}
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
        title={t('Confirm Deletion')}
        onClose={() => setDialogOpen(false)}
        actions={
          <>
            <Button
              onClick={() => setDialogOpen(false)}
              color="inherit"
              disabled={loading}
            >
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

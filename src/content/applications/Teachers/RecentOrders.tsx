import { Box, Button, CircularProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ReusableTable from 'src/components/Table';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import { fetchTeachers, deleteTeacher } from 'src/services/teacherService';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function TeachersContent() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);

  const navigate = useNavigate();

  useEffect(() => {
    loadTeachers();
  }, [limit, page]);

  const loadTeachers = async (searchQuery = '') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, total } = await fetchTeachers(page + 1, limit, searchQuery);
      const mappedTeachers = data.map((teacher: any) => ({
        id: teacher.id,
        employeeNumber: teacher.employeeNumber,
        contractStartDate: format(new Date(teacher.contractStartDate), 'dd/MM/yyyy'),
        contractEndDate: format(new Date(teacher.contractEndDate), 'dd/MM/yyyy'),
        hourlyRate: teacher.hourlyRate,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        franchise: teacher.franchiseName,
      }));
      setTeachers(mappedTeachers);
      setTotalCount(total);
    } catch (error: any) {
      setErrorMessage('Failed to load teachers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'firstName', headerName: 'First Name' },
    { field: 'lastName', headerName: 'Last Name' },
    { field: 'franchise', headerName: 'Franchise Name' },
    { field: 'email', headerName: 'Email' },
    { field: 'employeeNumber', headerName: 'Employee Number' },
    { field: 'contractStartDate', headerName: 'Contract Start Date' },
    { field: 'contractEndDate', headerName: 'Contract End Date' },
    { field: 'hourlyRate', headerName: 'Hourly Rate' },
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
      await deleteTeacher(selectedIds);
      await loadTeachers();
    } catch (error: any) {
      setErrorMessage('Failed to delete teachers.');
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
        data={teachers}
        columns={columns}
        title="Teacher List"
        onEdit={handleEdit}
        onView={handleView}
        onDelete={confirmDelete}
        onSearchChange={loadTeachers}
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
        <p>Are you sure you want to delete the selected teachers?</p>
      </ReusableDialog>
    </Box>
  );
}

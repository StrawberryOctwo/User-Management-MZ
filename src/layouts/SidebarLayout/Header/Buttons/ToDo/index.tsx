// src/components/ToDoHeader.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Button,
  Chip,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RoleBasedComponent from 'src/components/ProtectedComponent';
import {
  fetchToDosByAssignedBy,
  toggleToDoCompletion,
  assignToDoToRole,
  assignToDoToUsers,
  fetchAssignedUsersForTodo,
} from 'src/services/todoService';
import CustomRoleDialog from './CustomRoleDialog';
import AddToDoForm from './AddToDoForm';
import ToDoTable from './ToDoTable';
import { styled, alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { fetchFranchiseAdmins } from 'src/services/franchiseAdminService';
import { fetchLocationAdmins } from 'src/services/locationAdminService';
import { fetchStudents } from 'src/services/studentService';
import { fetchTeachers } from 'src/services/teacherService';

// Styled Components for enhanced visuals
const ActiveChip = styled(Chip)(({ theme }) => ({
  cursor: 'pointer',
  '&.MuiChip-filled': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  '&.MuiChip-outlined': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
  },
}));

const ToDoHeader: React.FC = () => {
  const theme = useTheme();
  const [todos, setTodos] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customRoleDialogOpen, setCustomRoleDialogOpen] = useState(false);
  const [selectedCustomTodoId, setSelectedCustomTodoId] = useState<number | null>(null);
  const [customRoleDialogOrigin, setCustomRoleDialogOrigin] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState({
    FranchiseAdmin: [],
    LocationAdmin: [],
    Teacher: [],
    Student: [],
  });
  const { t } = useTranslation();

  // Fetch ToDos when component mounts or page changes
  useEffect(() => {
    loadToDos(page);
  }, [page]);

  const limit = 5;

  const loadToDos = async (pageNumber: number) => {
    try {
      const { data, total, pageCount } = await fetchToDosByAssignedBy(pageNumber, limit);
      setTodos(data);
      setTotalPages(pageCount);
    } catch (error) {
      console.error('Failed to load ToDos:', error);
      setErrorMessage('Failed to load ToDos');
    }
  };

  const handleToggleCompletion = async (todoId: number) => {
    try {
      await toggleToDoCompletion(todoId);
      loadToDos(page);
    } catch (error) {
      console.error('Failed to toggle ToDo completion:', error);
      setErrorMessage('Failed to update ToDo');
    }
  };

  const handleOpenCustomRoleDialog = async (todoId: number) => {
    setSelectedCustomTodoId(todoId);
    setCustomRoleDialogOpen(true);

    try {
      const response = await fetchAssignedUsersForTodo(todoId);

      if (response && Array.isArray(response.assignees)) {
        const organizedUsers = {
          FranchiseAdmin: [],
          LocationAdmin: [],
          Teacher: [],
          Student: [],
        };

        response.assignees.forEach(user => {
          user.roles.forEach(role => {
            if (organizedUsers[role]) {
              organizedUsers[role].push({
                ...user,
                id: user.id || user.userId,
              });
            }
          });
        });

        setSelectedUsers(organizedUsers);
      } else {
        throw new Error('Assigned users data is not structured as expected');
      }
    } catch (error) {
      console.error('Failed to fetch assigned users:', error);
      setErrorMessage('Failed to load assigned users');
    }
  };

  const handleAssignRole = async (todoId: number, role: string) => {
    if (role === 'Custom') {
      setSelectedCustomTodoId(todoId);
      setCustomRoleDialogOrigin('AssignRole');
      handleOpenCustomRoleDialog(todoId);
    } else {
      await assignToDoToRole(todoId, role);
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === todoId ? { ...todo, assignedRole: role } : todo
        )
      );
    }
  };

  const reloadTable = () => {
    loadToDos(page);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const fetchDataFunctions = {
    FranchiseAdmin: (query: string) => fetchFranchiseAdmins(1, 5, query).then((data) => data.data),
    LocationAdmin: (query: string) => fetchLocationAdmins(1, 5, query).then((data) => data.data),
    Teacher: (query: string) => fetchTeachers(1, 5, query).then((data) => data.data),
    Student: (query: string) => fetchStudents(1, 5, query).then((data) => data.data),
  };

  // Handler to view assignees
  const handleViewAssignees = (todoId: number) => {
    setCustomRoleDialogOrigin('ViewAssignees');
    handleOpenCustomRoleDialog(todoId);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage My Created ToDos
      </Typography>
      <Divider />

      <RoleBasedComponent allowedRoles={['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher']}>
        {/* Add ToDo Section */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Add New ToDo
          </Typography>
          <AddToDoForm onAdd={() => loadToDos(page)} />
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* View ToDos Section */}
        <Box>
          <Typography variant="h6" gutterBottom>
            View ToDos
          </Typography>
          <ToDoTable
            todos={todos}
            onToggleCompletion={handleToggleCompletion}
            onAssignRole={handleAssignRole}
            onViewAssignees={handleViewAssignees}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            reloadTable={reloadTable}
          />
        </Box>
      </RoleBasedComponent>



      {/* Display Error Message */}
      {errorMessage && (
        <Box mt={2}>
          <Typography variant="body2" color="error">
            {errorMessage}
          </Typography>
        </Box>
      )}

      {/* Custom Role Dialog */}
      <Box sx={{ position: 'relative', padding: 2 }}>
        <CustomRoleDialog
          open={customRoleDialogOpen}
          onClose={() => setCustomRoleDialogOpen(false)}
          assignToDoToUsers={assignToDoToUsers}
          selectedCustomTodoId={selectedCustomTodoId}
          fetchDataFunctions={fetchDataFunctions}
          onSave={reloadTable}
          originName={customRoleDialogOrigin}
        />
      </Box>
    </Box>
  );
};

export default ToDoHeader;

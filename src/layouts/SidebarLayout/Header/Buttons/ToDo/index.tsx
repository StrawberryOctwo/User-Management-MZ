// src/components/ToDoHeader.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Tooltip,
  Divider,
  AccordionDetails,
  AccordionSummary,
  Accordion,
  Button,
  Chip,
  useTheme,
} from '@mui/material';
import SpatialAudioOffIcon from '@mui/icons-material/SpatialAudioOff';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import RoleBasedComponent from 'src/components/ProtectedComponent';
import {
  fetchToDosByAssignedBy,
  createToDo,
  toggleToDoCompletion,
  assignToDoToRole,
  assignToDoToUsers,
  fetchAssignedUsersForTodo,
} from 'src/services/todoService';
import { fetchFranchiseAdmins } from 'src/services/franchiseAdminService';
import { fetchLocationAdmins } from 'src/services/locationAdminService';
import { fetchStudents } from 'src/services/studentService';
import { fetchTeachers } from 'src/services/teacherService';
import CustomRoleDialog from './CustomRoleDialog';
import AddToDoForm from './AddToDoForm';
import ToDoTable from './ToDoTable';
import { styled, alpha } from '@mui/material/styles';

// Styled Components for enhanced visuals
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.light, 0.1),
  borderRadius: '4px',
}));

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const [expanded, setExpanded] = useState<string | false>('add'); // 'add' or 'view'

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

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    loadToDos(page);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setErrorMessage(null);
    setTodos([]);
  };

  const handleCloseCustomRoleDialog = () => {
    setCustomRoleDialogOpen(false);
    setSelectedUsers({
      FranchiseAdmin: [],
      LocationAdmin: [],
      Teacher: [],
      Student: [],
    });
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
      reloadTable();
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
    loadToDos(value);
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
    <Box sx={{ position: 'relative' }}>
      <Tooltip arrow title="Manage ToDos">
        <IconButton
          color="primary"
          onClick={handleOpenDialog}
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
            },
          }}
        >
          <SpatialAudioOffIcon color="primary" />
        </IconButton>
      </Tooltip>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        {/* Styled Dialog Title */}
        <StyledDialogTitle>
          <Typography variant="h6">Manage My Created ToDos</Typography>
          <IconButton onClick={handleCloseDialog} aria-label="close dialog">
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>
        <Divider />

        {/* Dialog Content */}
        <DialogContent dividers>
          <RoleBasedComponent allowedRoles={['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher']}>
            {/* Add ToDo Accordion */}
            <Accordion
              expanded={expanded === 'add'}
              onChange={() => setExpanded(expanded === 'add' ? false : 'add')}
              sx={{
                boxShadow: theme.shadows[1],
                borderRadius: '8px',
                mb: 2,
                '&:before': { display: 'none' },
              }}
            >
              <StyledAccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="add-content"
                id="add-header"
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <AddIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    Add New ToDo
                  </Typography>
                </Box>
              </StyledAccordionSummary>
              <AccordionDetails>
                <AddToDoForm onAdd={() => loadToDos(page)} />
              </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 2 }} />

            {/* View ToDos Accordion */}
            <Accordion
              expanded={expanded === 'view'}
              onChange={() => setExpanded(expanded === 'view' ? false : 'view')}
              sx={{
                boxShadow: theme.shadows[1],
                borderRadius: '8px',
                '&:before': { display: 'none' },
              }}
            >
              <StyledAccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="view-content"
                id="view-header"
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <VisibilityIcon color="secondary" />
                  <Typography variant="subtitle1" fontWeight="bold" color="secondary">
                    View ToDos
                  </Typography>
                </Box>
              </StyledAccordionSummary>
              <AccordionDetails>
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
                <Box sx={{ position: 'relative', padding: 2 }}>
                  <CustomRoleDialog
                    open={customRoleDialogOpen}
                    onClose={handleCloseCustomRoleDialog}
                    assignToDoToUsers={assignToDoToUsers}
                    selectedCustomTodoId={selectedCustomTodoId}
                    fetchDataFunctions={fetchDataFunctions}
                    onSave={reloadTable}
                    originName={customRoleDialogOrigin}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          </RoleBasedComponent>

          {/* Active Section Indicators */}
          <Box display="flex" gap={2} alignItems="center" mt={4}>
            <Typography variant="subtitle1" color="textSecondary">
              Current Section:
            </Typography>
            <ActiveChip
              icon={<AddIcon />}
              label="Create"
              variant={expanded === 'add' ? 'filled' : 'outlined'}
              color="primary"
              onClick={() => setExpanded(expanded === 'add' ? false : 'add')}
            />
            <ActiveChip
              icon={<VisibilityIcon />}
              label="View"
              variant={expanded === 'view' ? 'filled' : 'outlined'}
              color="secondary"
              onClick={() => setExpanded(expanded === 'view' ? false : 'view')}
            />
          </Box>

          {/* Display Error Message */}
          {errorMessage && (
            <Box mt={2}>
              <Typography variant="body2" color="error">
                {errorMessage}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>


    </Box>
  );
};

export default ToDoHeader;

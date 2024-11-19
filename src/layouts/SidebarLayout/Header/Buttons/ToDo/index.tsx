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
  Chip, // Import Chip for labels
} from '@mui/material';
import SpatialAudioOffIcon from '@mui/icons-material/SpatialAudioOff';
import AddIcon from '@mui/icons-material/Add'; // Icon for Create
import VisibilityIcon from '@mui/icons-material/Visibility'; // Icon for View
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close'; // Ensure CloseIcon is imported
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

const ToDoHeader: React.FC = () => {
  const [todos, setTodos] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDueDate, setNewDueDate] = useState('');
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
    setNewTitle('');
    setNewDescription('');
    setNewPriority('Medium');
    setNewDueDate('');
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

  const handleRoleInputChange = (role: string, selectedItems) => {
    setSelectedUsers((prev) => ({
      ...prev,
      [role]: [...prev[role], ...selectedItems.filter((item) => !prev[role].some((prevItem) => prevItem.id === item.id))]
    }));
  };

  const reloadTable = () => {
    loadToDos(page);
  };

  const handleRemoveUser = (role, userToRemove) => {
    setSelectedUsers((prev) => {
      const updatedUsers = prev[role].filter((user) => user.id !== userToRemove.id);

      return {
        ...prev,
        [role]: updatedUsers,
      };
    });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    loadToDos(value);
  };

  const fetchDataFunctions = {
    FranchiseAdmin: (query) => fetchFranchiseAdmins(1, 5, query).then((data) => data.data),
    LocationAdmin: (query) => fetchLocationAdmins(1, 5, query).then((data) => data.data),
    Teacher: (query) => fetchTeachers(1, 5, query).then((data) => data.data),
    Student: (query) => fetchStudents(1, 5, query).then((data) => data.data),
  };

  // Handler to view assignees
  const handleViewAssignees = (todoId: number) => {
    setCustomRoleDialogOrigin('ViewAssignees');
    handleOpenCustomRoleDialog(todoId);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Tooltip arrow title="Manage ToDos">
        <IconButton color="primary" onClick={handleOpenDialog}>
          <SpatialAudioOffIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>Manage My Created ToDos</DialogTitle>
        <DialogContent dividers>

          <RoleBasedComponent allowedRoles={['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher']}>
            <Accordion
              expanded={expanded === 'add'}
              onChange={() => setExpanded(expanded === 'add' ? false : 'add')}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="add-content"
                id="add-header"
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <AddIcon color="primary" /> {/* Icon indicating Create */}
                  <Typography variant="body1" fontWeight="bold">
                    Add New ToDo
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <AddToDoForm onAdd={() => loadToDos(page)} />
              </AccordionDetails>
            </Accordion>
            <Divider sx={{ my: 2 }} />
          </RoleBasedComponent>

          <Accordion
            expanded={expanded === 'view'}
            onChange={() => setExpanded(expanded === 'view' ? false : 'view')}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="view-content"
              id="view-header"
            >
              <Box display="flex" alignItems="center" gap={1}>
                <VisibilityIcon color="secondary" /> {/* Icon indicating View */}
                <Typography variant="body1" fontWeight="bold">
                  View ToDos
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <ToDoTable
                todos={todos}
                onToggleCompletion={handleToggleCompletion}
                onAssignRole={handleAssignRole}
                onViewAssignees={handleViewAssignees} // Pass the new prop
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                reloadTable={reloadTable}
              />
              <Box sx={{ position: 'relative', padding: 2 }}>
                <CustomRoleDialog
                  open={customRoleDialogOpen}
                  onClose={handleCloseCustomRoleDialog}
                  handleRoleInputChange={handleRoleInputChange}
                  handleRemoveUser={handleRemoveUser}
                  assignToDoToUsers={assignToDoToUsers}
                  selectedCustomTodoId={selectedCustomTodoId}
                  fetchDataFunctions={fetchDataFunctions}
                  onSave={reloadTable}
                  originName={customRoleDialogOrigin}
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Active Section Indicators */}
          <Box display="flex" gap={2} alignItems="center" mb={2}>
            <Typography variant="subtitle1">Current Section:</Typography>
            <Chip
              icon={<AddIcon />}
              label="Create"
              color="primary"
              variant={expanded === 'add' ? 'filled' : 'outlined'}
              onClick={() => setExpanded(expanded === 'add' ? false : 'add')}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              icon={<VisibilityIcon />}
              label="View"
              color="secondary"
              variant={expanded === 'view' ? 'filled' : 'outlined'}
              onClick={() => setExpanded(expanded === 'view' ? false : 'view')}
              sx={{ cursor: 'pointer' }}
            />
          </Box>

        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ToDoHeader;

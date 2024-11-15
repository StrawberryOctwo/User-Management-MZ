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
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { fetchToDosByAssignedBy, createToDo, toggleToDoCompletion, assignToDoToRole, assignToDoToUsers, fetchAssignedUsersForTodo } from 'src/services/todoService';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RoleBasedComponent from 'src/components/ProtectedComponent';
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
  const [selectedUsers, setSelectedUsers] = useState({
    FranchiseAdmin: [],
    LocationAdmin: [],
    Teacher: [],
    Student: [],
  });

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

  const handleAddToDo = async () => {
    if (!newTitle || !newDueDate) {
      setErrorMessage('ToDo title and due date are required.');
      return;
    }

    try {
      await createToDo({
        title: newTitle,
        description: newDescription,
        priority: newPriority,
        dueDate: newDueDate,
      });
      loadToDos(page);
    } catch (error) {
      console.error('Failed to add ToDo:', error);
      setErrorMessage('Failed to add ToDo');
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

        // Organize users based on roles
        response.assignees.forEach(user => {
          user.roles.forEach(role => {
            if (organizedUsers[role]) {
              organizedUsers[role].push(user);
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

  const handleRemoveUser = (role, userToRemove) => {
    setSelectedUsers((prev) => ({
      ...prev,
      [role]: prev[role].filter((user) => user.id !== userToRemove.id),
    }));
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

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
      default:
        return 'success';
    }
  };

  return (
    <Box sx={{ position: 'relative', padding: 2 }}>
      <Tooltip arrow title="Manage ToDos">
        <IconButton color="primary" onClick={handleOpenDialog}>
          <AssignmentIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>Manage My Created ToDos</DialogTitle>
        <DialogContent dividers>

          <RoleBasedComponent allowedRoles={['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher']}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
                <Typography variant="body1" fontWeight="bold">Add New ToDo</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <AddToDoForm onAdd={handleAddToDo} />
              </AccordionDetails>
            </Accordion>
            <Divider sx={{ my: 2 }} />
          </RoleBasedComponent>

          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography variant="body1" fontWeight="bold">
                View ToDos
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ToDoTable
                todos={todos}
                onToggleCompletion={handleToggleCompletion}
                onAssignRole={handleAssignRole}
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
              <Box sx={{ position: 'relative', padding: 2 }}>
                <CustomRoleDialog
                  open={customRoleDialogOpen}
                  onClose={handleCloseCustomRoleDialog}
                  selectedUsers={selectedUsers}
                  handleRoleInputChange={handleRoleInputChange}
                  handleRemoveUser={handleRemoveUser}
                  assignToDoToUsers={assignToDoToUsers}
                  selectedCustomTodoId={selectedCustomTodoId}
                  fetchDataFunctions={fetchDataFunctions}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ToDoHeader;

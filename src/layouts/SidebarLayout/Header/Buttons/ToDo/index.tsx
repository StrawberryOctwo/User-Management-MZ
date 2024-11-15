import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  TextField,
  Pagination,
  Tooltip,
  Divider,
  Paper,
  Grid,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  AccordionDetails,
  AccordionSummary,
  Accordion,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { fetchToDosByAssignedBy, createToDo, toggleToDoCompletion, assignToDoToRole, assignToDoToUsers, fetchAssignedUsersForTodo } from 'src/services/todoService';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Import the ExpandMoreIcon component from the appropriate package
import RoleBasedComponent from 'src/components/ProtectedComponent';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import { fetchFranchiseAdmins } from 'src/services/franchiseAdminService';
import { fetchLocationAdmins } from 'src/services/locationAdminService';
import { fetchStudents } from 'src/services/studentService';
import { fetchTeachers } from 'src/services/teacherService';
import { set } from 'date-fns';

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
  const [availableUsers, setAvailableUsers] = useState({
    FranchiseAdmin: [],
    LocationAdmin: [],
    Teacher: [],
    Student: [],
  }); // Separate state for fetched users

  const limit = 5; // Pagination limit per page

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
    loadToDos(page); // Load ToDos only when dialog is opened
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
      handleCloseDialog();
      loadToDos(page); // Refresh ToDo list
    } catch (error) {
      console.error('Failed to add ToDo:', error);
      setErrorMessage('Failed to add ToDo');
    }
  };

  const handleToggleCompletion = async (todoId: number) => {
    try {
      await toggleToDoCompletion(todoId);
      loadToDos(page); // Refresh list to show updated status
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
        // Manually assign users to roles based on your logic.
        // Adjust the logic below according to your actual requirements.
        const organizedUsers = {
          FranchiseAdmin: response.assignees.filter(user => user.email.includes('franchise')),
          LocationAdmin: response.assignees.filter(user => user.email.includes('location')),
          Teacher: response.assignees.filter(user => user.email.includes('teacher')),
          Student: response.assignees.filter(user => user.email.includes('student')),
        };

        console.log(organizedUsers)
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
      handleOpenCustomRoleDialog(todoId); // Open custom dialog when "Custom" is selected
    } else {
      // Assign role directly if not "Custom"
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
    loadToDos(value); // Load the ToDos for the new page
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
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />} // Use the imported ExpandMoreIcon component
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography variant="body1" fontWeight="bold">
                  Add New ToDo
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Title"
                      variant="outlined"
                      fullWidth
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={3}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Due Date"
                      type="date"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Priority</InputLabel>
                      <Select
                        label="Priority"
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                      >
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                {/* Right-aligned Save ToDo button */}
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button onClick={handleAddToDo} color="primary" variant="contained">
                    Save ToDo
                  </Button>
                </Box>
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
              <TableContainer component={Paper} elevation={3} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Completed</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Assigned Role</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {todos.map((todo) => (
                      <TableRow key={todo.id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={todo.completed}
                            onChange={() => handleToggleCompletion(todo.id)}
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>{todo.title}</TableCell>
                        <TableCell>
                          <Chip label={todo.priority} color={priorityColor(todo.priority)} size="small" />
                        </TableCell>
                        <TableCell>
                          {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No Due Date'}
                        </TableCell>
                        <TableCell>
                          <FormControl fullWidth variant="outlined" sx={{ minWidth: 140, mr: 2 }}>
                            <InputLabel>Assign Role</InputLabel>
                            <Select
                              label="Assign Role"
                              value={todo.assignedRole || ''}
                              onChange={(e) => handleAssignRole(todo.id, e.target.value)}
                            >
                              <MenuItem value="FranchiseAdmin">Franchise Admin</MenuItem>
                              <MenuItem value="LocationAdmin">Location Admin</MenuItem>
                              <MenuItem value="Teacher">Teacher</MenuItem>
                              <MenuItem value="Student">Student</MenuItem>
                              <MenuItem value="Custom">Custom</MenuItem> {/* Custom option */}
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    ))}

                    {todos.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No ToDos found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
              </Box>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
      </Dialog>


      <Dialog open={customRoleDialogOpen} onClose={handleCloseCustomRoleDialog} fullWidth>
        <DialogTitle>Assign Custom Roles</DialogTitle>
        <DialogContent dividers>
          {['FranchiseAdmin', 'LocationAdmin', 'Teacher', 'Student'].map((role) => {
            let allowedRoles = [];
            let fetchData;
            let label;

            switch (role) {
              case 'FranchiseAdmin':
                allowedRoles = ['SuperAdmin'];
                fetchData = (query) => fetchFranchiseAdmins(1, 5, query).then((data) => data.data);
                label = 'Franchise Admins';
                break;
              case 'LocationAdmin':
                allowedRoles = ['FranchiseAdmin'];
                fetchData = (query) => fetchLocationAdmins(1, 5, query).then((data) => data.data);
                label = 'Location Admins';
                break;
              case 'Teacher':
                allowedRoles = ['FranchiseAdmin', 'LocationAdmin'];
                fetchData = (query) => fetchTeachers(1, 5, query).then((data) => data.data);
                label = 'Teachers';
                break;
              case 'Student':
                allowedRoles = ['FranchiseAdmin', 'LocationAdmin', 'Teacher'];
                fetchData = (query) => fetchStudents(1, 5, query).then((data) => data.data);
                label = 'Students';
                break;
              default:
                allowedRoles = [];
                fetchData = () => Promise.resolve([]);
                label = '';
            }

            return (
              <RoleBasedComponent key={role} allowedRoles={allowedRoles}>
                <Box sx={{ minWidth: 180, mb: 2 }}>
                  <MultiSelectWithCheckboxes
                    label={label}
                    fetchData={fetchData}
                    onSelect={(selectedItems) => handleRoleInputChange(role, selectedItems)}
                    displayProperty="firstName"
                    placeholder={`Type to search ${role.toLowerCase()}`}
                    hideSelected
                    initialValue={selectedUsers[role]}
                  />
                </Box>
              </RoleBasedComponent>
            );
          })}

          {/* Display selected users below all inputs */}
          <Box mt={3}>
            <Typography variant="h6">Selected Users:</Typography>
            {Object.keys(selectedUsers).map((role) =>
              selectedUsers[role].length > 0 && (
                <Box key={role} mt={1}>
                  <Typography variant="subtitle1">{role}:</Typography>
                  <Box pl={2}>
                    {selectedUsers[role].map((user) => (
                      <Box
                        key={user.id}
                        display="flex"
                        alignItems="center"
                        sx={{
                          position: 'relative',
                          '&:hover .remove-btn': { visibility: 'visible' },
                        }}
                      >
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          - {user.firstName} {user.lastName}
                        </Typography>
                        <IconButton
                          className="remove-btn"
                          size="small"
                          color="secondary"
                          onClick={() => handleRemoveUser(role, user)}
                          sx={{
                            visibility: 'hidden', // Initially hidden, shown on hover
                          }}
                        >
                          &times;
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCustomRoleDialog} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              const allSelectedUserIds = Object.entries(selectedUsers).flatMap(([role, users]) =>
                users.map((user) => (role === 'Teacher' || role === 'Student' ? user.userId : user.id))
              );
              try {
                await assignToDoToUsers(selectedCustomTodoId, allSelectedUserIds);
                console.log('ToDo successfully assigned to users');
              } catch (error) {
                console.error('Error assigning ToDo to users:', error);
                setErrorMessage('Failed to assign ToDo to selected users');
              }
            }}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default ToDoHeader;

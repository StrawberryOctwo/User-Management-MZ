import React, { useState } from 'react';
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
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { fetchToDosByAssignedBy, createToDo, toggleToDoCompletion, assignToDoToRole } from 'src/services/todoService';

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
    setTodos([]); // Clear the ToDos list when closing the dialog
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

  const handleAssignRole = async (todoId: number, role: string) => {
    try {
      await assignToDoToRole(todoId, role);
      loadToDos(page); // Refresh list to show updated assignment
    } catch (error) {
      console.error('Failed to assign role to ToDo:', error);
      setErrorMessage('Failed to assign role');
    }
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
        <Button
          variant="contained"
          color="primary"
          startIcon={<AssignmentIcon />}
          onClick={handleOpenDialog}
        >
          Manage ToDos
        </Button>
      </Tooltip>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>Manage My ToDos</DialogTitle>
        <DialogContent dividers>
          {errorMessage && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {errorMessage}
            </Typography>
          )}

          {/* ToDo Table */}
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
                      <FormControl fullWidth variant="outlined">
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

          <Divider sx={{ my: 2 }} />

          {/* Add ToDo Form */}
          <Typography variant="h6" align="center" gutterBottom>
            Add New ToDo
          </Typography>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddToDo} color="primary" variant="contained">
            Save ToDo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ToDoHeader;

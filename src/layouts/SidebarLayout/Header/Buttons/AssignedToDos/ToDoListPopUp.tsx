import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Popover,
  List,
  Card,
  Typography,
  Checkbox,
  Tooltip,
  Chip,
  TextField,
  MenuItem,
  CircularProgress,
  Pagination,
  Divider,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Done as DoneIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { fetchToDosForSelf, toggleToDoCompletion } from 'src/services/todoService';

const HeaderToDoList: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [todos, setToDos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [loading, setLoading] = useState(false);

  const fetchTodos = async (currentPage = 1) => {
    setLoading(true);
    try {
      const response = await fetchToDosForSelf({
        page: currentPage,
        limit: 10,
        sort: 'priority',
        search: searchQuery,
        priority: priorityFilter !== 'All' ? priorityFilter : undefined,
      });
      const { data, total, pageCount } = response;
      setToDos(data || []);
      setTotalPages(pageCount);
    } catch (error) {
      console.error('Error fetching ToDos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos(page);
  }, [page, priorityFilter, searchQuery]);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleComplete = async (todoId: number) => {
    try {
      await toggleToDoCompletion(todoId);
      setToDos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
        )
      );
    } catch (error) {
      console.error('Failed to toggle completion status:', error);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      default:
        return 'success';
    }
  };

  const formatDateGerman = (date: string | null) => {
    return date ? new Date(date).toLocaleDateString('de-DE') : 'Kein Fälligkeitsdatum';
  };

  const completedTodos = todos.filter((todo) => todo.completed);
  const pendingTodos = todos.filter((todo) => !todo.completed);

  return (
    <>
      <Tooltip title="View ToDos">
        <IconButton color="primary" onClick={handleOpen}>
          <AssignmentIcon />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 500, p: 2, borderRadius: 2 },
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">My ToDos</Typography>
          <Chip
            label={`${todos.length} Tasks`}
            color="primary"
            size="small"
            icon={<AssignmentIcon />}
            sx={{ fontSize: '0.75rem' }}
          />
        </Box>
        <Box display="flex" gap={1} mb={2}>
          <TextField
            label="Search"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
            }}
          />
          <TextField
            select
            label="Priority"
            size="small"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </TextField>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : todos.length === 0 ? (
          <Typography color="text.secondary" align="center" mt={2}>
            No ToDos match your criteria.
          </Typography>
        ) : (
          <List>
            {pendingTodos.length > 0 && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Pending Tasks
                </Typography>
                {pendingTodos.map((todo) => (
                  <Card
                    key={todo.id}
                    variant="outlined"
                    sx={{
                      mb: 2,
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      backgroundColor: '#fff9c4', // Light yellow for pending
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center">
                        <Checkbox
                          checked={todo.completed}
                          onChange={() => handleToggleComplete(todo.id)}
                          color="primary"
                          sx={{
                            '&.Mui-checked': { color: 'green' },
                          }}
                        />
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                          }}
                        >
                          {todo.title}
                        </Typography>
                      </Box>
                      <Chip
                        label={todo.priority}
                        color={getPriorityColor(todo.priority)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {todo.description || 'No description provided'}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontStyle: 'italic' }}
                      >
                        Assigned By: {todo.assignedBy?.firstName} {todo.assignedBy?.lastName}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontStyle: 'italic' }}
                      >
                        {formatDateGerman(todo.dueDate)}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </>
            )}
            {completedTodos.length > 0 && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                  Completed Tasks
                </Typography>
                {completedTodos.map((todo) => (
                  <Card
                    key={todo.id}
                    variant="outlined"
                    sx={{
                      mb: 2,
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      backgroundColor: '#e8f5e9', // Light green for completed
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center">
                        <Checkbox
                          checked={todo.completed}
                          onChange={() => handleToggleComplete(todo.id)}
                          color="primary"
                        />
                        <Typography
                          variant="body1"
                          sx={{
                            textDecoration: 'line-through',
                            fontWeight: 500,
                          }}
                        >
                          {todo.title}
                        </Typography>
                      </Box>
                      <Chip
                        label={todo.priority}
                        color={getPriorityColor(todo.priority)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {todo.description || 'No description provided'}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontStyle: 'italic' }}
                      >
                        Assigned By: {todo.assignedBy?.firstName} {todo.assignedBy?.lastName}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontStyle: 'italic' }}
                      >
                        {formatDateGerman(todo.dueDate)}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </>
            )}
          </List>
        )}
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            size="small"
          />
        </Box>
      </Popover>
    </>
  );
};

export default HeaderToDoList;

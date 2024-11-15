import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Popover,
  List,
  ListItem,
  Typography,
  Divider,
  Checkbox,
  Tooltip,
  Chip,
  TextField,
  MenuItem,
  Button,
  Pagination,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import { fetchToDosForSelf, toggleToDoCompletion } from 'src/services/todoService';
import { green } from '@mui/material/colors';

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

  const handleToggleComplete = async (todoId: number, completed: boolean) => {
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
      case 'Low':
      default:
        return 'success';
    }
  };

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
          sx: { width: 500, maxHeight: 600, overflow: 'auto', p: 3, borderRadius: 3 },
        }}
      >
        <Typography variant="h6" gutterBottom>
          My ToDos
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <TextField
            select
            label="Priority"
            variant="outlined"
            size="small"
            fullWidth
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
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
          <Typography variant="body2" color="text.secondary" align="center" mt={2}>
            No ToDos match your criteria
          </Typography>
        ) : (
          <List sx={{ overflow: 'auto' }}>
            {todos.map((todo) => (
            <Card key={todo.id} sx={{ mb: 2, boxShadow: 2 }}>
            <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                <Checkbox
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo.id, !todo.completed)}
                    size="small"
                    color="primary"
                />
                <Typography
                    variant="subtitle1"
                    sx={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
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
                icon={<PriorityHighIcon />}
                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                />
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={1}>
                <EventIcon fontSize="small" color="action" />
                <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: 'text.secondary',
                        ml:2
                     }}
                >
                    {todo.dueDate
                    ? new Date(todo.dueDate).toLocaleDateString()
                    : 'No Due Date'}
                </Typography>
                </Box>
                <Box sx={{
                    borderRadius: 1,
                    backgroundColor: todo.completed? '#57CA221A':'#f5f5f5',
                    
                }}
                color="primary">
                <Typography
                    variant="subtitle1"
                    sx={{
                    fontWeight: 500,
                    }}
                >
                    {todo.title}
                </Typography>
                <Typography
                variant="body2"
                sx={{
                    flex: 1,
                    color: 'text.secondary',
                    p: 1,
                    borderRadius: 1,
                }}
                >
                {todo.description || 'No description available'}
                </Typography>
               
                </Box>

            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontStyle: 'italic' }}
                >
                Assigned by: {todo.assignedBy.firstName} {todo.assignedBy.lastName}
                </Typography>
            </Box>
            </CardContent>
            </Card>
            ))}
          </List>
        )}
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Popover>
    </>
  );
};

export default HeaderToDoList;

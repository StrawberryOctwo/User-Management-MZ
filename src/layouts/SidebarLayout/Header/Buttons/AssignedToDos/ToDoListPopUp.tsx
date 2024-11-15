import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Popover,
  List,
  Card,
  Typography,
  Button,
  Tooltip,
  Chip,
  TextField,
  MenuItem,
  CircularProgress,
  Pagination,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { fetchToDosForSelf, toggleToDoCompletion } from 'src/services/todoService';

const HeaderToDoList: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [todos, setToDos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(localStorage.getItem('searchQuery') || '');
  const [priorityFilter, setPriorityFilter] = useState<string>(
    localStorage.getItem('priorityFilter') || 'All'
  );
  const [loading, setLoading] = useState(false);
  const [showPending, setShowPending] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);

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
      const { data, pageCount } = response;
      setToDos(data || []);
      setTotalPages(pageCount);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos(page);
  }, [page, priorityFilter, searchQuery]);

  useEffect(() => {
    localStorage.setItem('searchQuery', searchQuery);
    localStorage.setItem('priorityFilter', priorityFilter);
  }, [searchQuery, priorityFilter]);

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
      console.error('Failed to update task!', error);
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

  const renderTodoList = (list: any[], isCompleted: boolean) =>
    list.map((todo) => (
      <Card 
        key={todo.id}
        variant="outlined"
        sx={{
          mb: 2,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          backgroundColor: isCompleted ? '#e8f5e9' : '#fffde7',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              textDecoration: isCompleted ? 'line-through' : 'none',
            }}
          >
            {todo.title}
          </Typography>
          <Chip label={todo.priority} color={getPriorityColor(todo.priority)} size="small" />
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
        <Button
          variant="text"
          color={isCompleted ? 'secondary' : 'primary'}
          sx={{ alignSelf: 'flex-end', mt: 1 }}
          onClick={() => handleToggleComplete(todo.id)}
        >
          {isCompleted ? 'Reopen Task' : 'Mark as Complete'}
        </Button>
      </Card>
    ));

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
        <Typography variant="h6" sx={{ mb: 2 }}>
          My ToDos
        </Typography>
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
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              No ToDos match your criteria.
            </Typography>
          </Box>
        ) : (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Pending Tasks
              </Typography>
              <IconButton
                size="small"
                onClick={() => setShowPending((prev) => !prev)}
              >
                {showPending ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={showPending}>
              {renderTodoList(pendingTodos, false)}
            </Collapse>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Completed Tasks
              </Typography>
              <IconButton
                size="small"
                onClick={() => setShowCompleted((prev) => !prev)}
              >
                {showCompleted ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={showCompleted}>
              {renderTodoList(completedTodos, true)}
            </Collapse>
          </>
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

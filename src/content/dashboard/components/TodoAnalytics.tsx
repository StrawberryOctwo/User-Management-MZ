import {
  CardHeader,
  Divider,
  Card,
  List,
  ListItem,
  Box,
  Typography,
  styled,
  Avatar,
  Grow,
  TablePagination,
  useTheme
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useTranslation } from 'react-i18next';
import { useDashboard } from 'src/contexts/DashboardContext';
import { t } from "i18next"

// Styled Components
const ImageWrapper = styled(Avatar)(
  ({ theme }) => `
    margin-right: ${theme.spacing(2)};
    background-color: ${theme.palette.primary.main};
    width: 40px;
    height: 40px;
  `
);

const ListItemWrapper = styled(ListItem)(`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-radius: 8px;
  transition: background-color 0.3s;
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`);

function RecentTodos() {
  const { t } = useTranslation();
  const { todos, todoPage, setTodoPage, todoLimit, setTodoLimit } =
    useDashboard();
  const theme = useTheme();

  const handlePageChange = (event, newPage) => {
    setTodoPage(newPage + 1); // Convert zero-based index to one-based index for the backend
  };

  const handleRowsPerPageChange = (event) => {
    setTodoLimit(parseInt(event.target.value, 5));
    setTodoPage(1); // Reset to the first page when changing rows per page
  };

  // Calculate paginated todos
  const paginatedTodos = Array.isArray(todos)
    ? todos.slice(
      (todoPage - 1) * todoLimit,
      (todoPage - 1) * todoLimit + todoLimit
    )
    : [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return theme.colors.error.main;
      case 'Medium':
        return theme.colors.warning.main;
      case 'Low':
        return theme.colors.success.main;
      default:
        return theme.colors.info.main;
    }
  };

  return (
    <Card>
      <CardHeader title={t('Recent Todos')} />
      <Divider />
      <List disablePadding component="nav">
        {paginatedTodos.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <Typography variant="h6" color="text.secondary">
              {t("no_todos_available")}
            </Typography>
          </Box>
        ) : (
          paginatedTodos.map((todo, index) => (
            <Grow in key={todo.id} timeout={(index + 1) * 300}>
              <Box>
                <ListItemWrapper>
                  <Box display="flex" alignItems="center" width="100%">
                    {/* Todo Icon */}
                    <Box mr={2}>
                      <ImageWrapper
                        sx={{
                          backgroundColor: getPriorityColor(todo.priority)
                        }}
                      >
                        <AssignmentIcon />
                      </ImageWrapper>
                    </Box>

                    {/* Todo Details */}
                    <Box>
                      <Typography
                        variant="h6"
                        color="text.primary"
                        noWrap
                        sx={{ minWidth: 100 }}
                      >
                        {todo.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("priority")}: {todo.priority}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("due_date")} : {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No Due Date'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("assigned_roles")}:{' '}
                        {Array.isArray(todo.assignedRoles)
                          ? todo.assignedRoles.join(', ')
                          : todo.assignedRoles}{' '}
                      </Typography>
                    </Box>
                  </Box>
                </ListItemWrapper>
                {index < paginatedTodos.length - 1 && <Divider />}
              </Box>
            </Grow>
          ))
        )}
      </List>
      <Divider />
      {/* Pagination */}
      {todos.length > 0 && (
        <TablePagination
          component="div"
          count={todos.length}
          page={todoPage - 1} // Convert one-based index to zero-based for the frontend
          onPageChange={handlePageChange}
          rowsPerPage={todoLimit}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[2, 5, 10]}
        />
      )}
    </Card>
  );
}

export default RecentTodos;

import React, { useState } from 'react';
import {
    Box,
    Chip,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination,
    Menu,
    MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface ToDoTableProps {
    todos: any[];
    onToggleCompletion: (todoId: number) => void;
    onAssignRole: (todoId: number, role: string) => void;
    page: number;
    totalPages: number;
    onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
    reloadTable: () => void; // Function to reload table data after role assignment
}

const ToDoTable: React.FC<ToDoTableProps> = ({
    todos,
    onToggleCompletion,
    onAssignRole,
    page,
    totalPages,
    onPageChange,
    reloadTable,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);

    const handleOpenRoleMenu = (event: React.MouseEvent<HTMLElement>, todoId: number) => {
        setAnchorEl(event.currentTarget);
        setSelectedTodoId(todoId);
    };

    const handleCloseRoleMenu = () => {
        setAnchorEl(null);
        setSelectedTodoId(null);
    };

    const handleSelectRole = (role: string) => {
        if (selectedTodoId !== null) {
            onAssignRole(selectedTodoId, role);
            reloadTable(); // Reload table data after assigning role
        }
        handleCloseRoleMenu();
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
        <Box>
            <TableContainer component={Paper} elevation={3} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Assigned Roles</TableCell>
                            <TableCell>Assign Role</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {todos.map((todo) => (
                            <TableRow key={todo.id}>
                                <TableCell>{todo.title}</TableCell>
                                <TableCell>
                                    <Chip label={todo.priority} color={priorityColor(todo.priority)} size="small" />
                                </TableCell>
                                <TableCell>
                                    {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No Due Date'}
                                </TableCell>
                                <TableCell>
                                    {todo.assignedRoles && (
                                        <Chip label={todo.assignedRoles} color="primary" size="small" sx={{ ml: 1 }} />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <IconButton color="primary" onClick={(e) => handleOpenRoleMenu(e, todo.id)}>
                                        <AddIcon />
                                    </IconButton>
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
            <Box display="flex" justifyContent="center" mt={2}>
                <Pagination count={totalPages} page={page} onChange={onPageChange} color="primary" />
            </Box>

            {/* Role Assignment Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseRoleMenu}
                anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
                transformOrigin={{ vertical: 'center', horizontal: 'left' }}
            >
                <MenuItem onClick={() => handleSelectRole('FranchiseAdmin')}>Franchise Admin</MenuItem>
                <MenuItem onClick={() => handleSelectRole('LocationAdmin')}>Location Admin</MenuItem>
                <MenuItem onClick={() => handleSelectRole('Teacher')}>Teacher</MenuItem>
                <MenuItem onClick={() => handleSelectRole('Student')}>Student</MenuItem>
                <MenuItem onClick={() => handleSelectRole('Custom')}>Custom</MenuItem>
            </Menu>
        </Box>
    );
};

export default ToDoTable;

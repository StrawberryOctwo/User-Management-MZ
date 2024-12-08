// src/components/ToDoTable.tsx

import React, { useState } from 'react';
import {
    Box,
    Chip,
    IconButton,
    Tooltip,
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
import AssignmentIcon from '@mui/icons-material/Assignment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RoleBasedComponent from 'src/components/ProtectedComponent';

interface ToDoTableProps {
    todos: any[];
    onToggleCompletion: (todoId: number) => void;
    onAssignRole: (todoId: number, role: string) => void;
    onViewAssignees: (todoId: number) => void;
    page: number;
    totalPages: number;
    onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
    reloadTable: () => void;
}

const ToDoTable: React.FC<ToDoTableProps> = ({
    todos,
    onToggleCompletion,
    onAssignRole,
    onViewAssignees,
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

    const handleSelectRole = async (role: string) => {
        if (selectedTodoId !== null) {
            await onAssignRole(selectedTodoId, role);
            reloadTable();
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

    const allowedRolesMap: { [key: string]: string[] } = {
        FranchiseAdmin: ['SuperAdmin'],
        LocationAdmin: ['FranchiseAdmin'],
        Teacher: ['FranchiseAdmin', 'LocationAdmin'],
        Student: ['FranchiseAdmin', 'LocationAdmin', 'Teacher'],
        Custom: ['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher'],
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
                            <TableCell>Actions</TableCell>
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
                                    {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('de') : 'No Due Date'}
                                </TableCell>
                                <TableCell>
                                    {todo.assignedRoles && (
                                        <Chip label={todo.assignedRoles} color="primary" size="small" sx={{ ml: 1 }} />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Assign Role">
                                        <IconButton
                                            color="primary"
                                            onClick={(e) => handleOpenRoleMenu(e, todo.id)}
                                            aria-label="assign role"
                                        >
                                            <AssignmentIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="View Assignees">
                                        <IconButton
                                            color="secondary"
                                            onClick={() => onViewAssignees(todo.id)}
                                            aria-label="view assignees"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
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

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseRoleMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'center', horizontal: 'left' }}
            >
                {Object.keys(allowedRolesMap).map((roleKey) => (
                    <RoleBasedComponent key={roleKey} allowedRoles={allowedRolesMap[roleKey]}>
                        <MenuItem onClick={() => handleSelectRole(roleKey)}>
                            {roleKey === 'FranchiseAdmin' ? 'Franchise Admin' :
                                roleKey === 'LocationAdmin' ? 'Location Admin' :
                                    roleKey === 'Teacher' ? 'Teacher' :
                                        roleKey === 'Student' ? 'Student' : 'Custom'}
                        </MenuItem>
                    </RoleBasedComponent>
                ))}
            </Menu>
        </Box>
    );
};

export default ToDoTable;

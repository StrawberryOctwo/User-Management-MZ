import React from 'react';
import {
    Box,
    Checkbox,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination,
} from '@mui/material';

interface ToDoTableProps {
    todos: any[];
    onToggleCompletion: (todoId: number) => void;
    onAssignRole: (todoId: number, role: string) => void;
    page: number;
    totalPages: number;
    onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

const ToDoTable: React.FC<ToDoTableProps> = ({
    todos,
    onToggleCompletion,
    onAssignRole,
    page,
    totalPages,
    onPageChange,
}) => {
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
                                        onChange={() => onToggleCompletion(todo.id)}
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
                                            onChange={(e) => onAssignRole(todo.id, e.target.value)}
                                        >
                                            <MenuItem value="FranchiseAdmin">Franchise Admin</MenuItem>
                                            <MenuItem value="LocationAdmin">Location Admin</MenuItem>
                                            <MenuItem value="Teacher">Teacher</MenuItem>
                                            <MenuItem value="Student">Student</MenuItem>
                                            <MenuItem value="Custom">Custom</MenuItem>
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
            <Box display="flex" justifyContent="center" mt={2}>
                <Pagination count={totalPages} page={page} onChange={onPageChange} color="primary" />
            </Box>
        </Box>
    );
};

export default ToDoTable;

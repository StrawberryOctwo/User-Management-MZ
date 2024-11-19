// src/components/CustomRoleDialog.tsx
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    TextField,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TablePagination,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CircularProgress,
    Snackbar,
    Alert,
    Chip,
    Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import RoleBasedComponent from 'src/components/ProtectedComponent';
import MultiSelectWithCheckboxesNoSelect from 'src/components/SearchBars/MultiSelectWithCkeckboxesNoSelect';
import { useAuth } from 'src/hooks/useAuth';
import { fetchAssignedUsersForTodo } from 'src/services/todoService';
import { styled, alpha, useTheme } from '@mui/material/styles';

interface User {
    id?: number;
    userId?: number;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    completed: boolean;
}

interface CustomRoleDialogProps {
    open: boolean;
    onClose: () => void;
    handleRoleInputChange: (role: string, selectedItems: any[]) => void;
    handleRemoveUser: (role: string, user: User) => void;
    assignToDoToUsers: (todoId: number | null, userIds: number[]) => Promise<void>;
    selectedCustomTodoId: number | null;
    fetchDataFunctions: { [role: string]: (query: string) => Promise<any[]> };
    onSave: () => void;
    originName: string;
}

const rolesConfig = [
    {
        role: 'FranchiseAdmin',
        label: 'Franchise Admins',
        allowedRoles: ['SuperAdmin'],
        idField: 'id',
    },
    {
        role: 'LocationAdmin',
        label: 'Location Admins',
        allowedRoles: ['FranchiseAdmin'],
        idField: 'id',
    },
    {
        role: 'Teacher',
        label: 'Teachers',
        allowedRoles: ['FranchiseAdmin', 'LocationAdmin'],
        idField: 'userId',
    },
    {
        role: 'Student',
        label: 'Students',
        allowedRoles: ['FranchiseAdmin', 'LocationAdmin', 'Teacher'],
        idField: 'userId',
    },
];

// Styled Components for enhanced visuals
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    backgroundColor: alpha(theme.palette.secondary.light, 0.1),
    borderRadius: '4px',
}));

const ActiveChip = styled(Chip)(({ theme }) => ({
    cursor: 'pointer',
    '&.MuiChip-filled': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    '&.MuiChip-outlined': {
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
    },
}));

const CustomRoleDialog: React.FC<CustomRoleDialogProps> = ({
    open,
    onClose,
    handleRoleInputChange,
    handleRemoveUser,
    assignToDoToUsers,
    selectedCustomTodoId,
    fetchDataFunctions,
    onSave,
    originName
}) => {
    const theme = useTheme();
    const [filter, setFilter] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const [page, setPage] = useState(0); // Zero-based index
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [expanded, setExpanded] = useState<string | false>('add'); // 'add' or 'table'
    const [assignees, setAssignees] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({ open: false, message: '', severity: 'success' });

    // Accessing userRoles from useAuth hook
    const { userRoles } = useAuth(); // e.g., userRoles = ['SuperAdmin']

    // Helper function to check if a role is allowed based on userRoles
    const isRoleAllowed = (
        roleAllowedRoles: string[],
        userRoles: string[]
    ): boolean => {
        return roleAllowedRoles.some((allowedRole) =>
            userRoles.includes(allowedRole)
        );
    };

    // Filter rolesConfig to determine which roles the current user can see in the filter selector
    const allowedRolesForFilter = rolesConfig.filter(({ allowedRoles }) =>
        isRoleAllowed(allowedRoles, userRoles)
    );

    // Fetch assignees from the API
    const fetchAssignees = async () => {
        if (!selectedCustomTodoId) return;

        setLoading(true);
        try {
            const data = await fetchAssignedUsersForTodo(selectedCustomTodoId, {
                search: filter,
                role: selectedRole !== 'All' ? selectedRole : '',
                page: page + 1, // API is one-based
                limit: rowsPerPage,
            });
            setAssignees(data.assignees);
            setTotal(data.total);
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Failed to fetch assigned users.',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch assignees when component mounts or when dependencies change
    useEffect(() => {
        if (open && selectedCustomTodoId) {
            fetchAssignees();
        }
    }, [open, selectedCustomTodoId, filter, selectedRole, page, rowsPerPage]);

    // Handlers for pagination
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page
    };

    // Handlers for accordion expansion
    const handleAccordionChange = (panel: string) => (
        event: React.SyntheticEvent,
        isExpanded: boolean
    ) => {
        setExpanded(isExpanded ? panel : false);
    };

    // Handler to close Snackbar
    const handleCloseSnackbar = (
        event?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            {/* Styled Dialog Title */}
            <StyledDialogTitle>
                <Typography variant="h6">
                    {originName === 'AssignRole' ? 'Assign Custom Roles' : 'View Assigned Users'}
                </Typography>
                <IconButton onClick={onClose} aria-label="close dialog">
                    <CloseIcon />
                </IconButton>
            </StyledDialogTitle>
            <Divider />

            {/* Dialog Content */}
            <DialogContent dividers>
                {originName === 'AssignRole' && (
                    <Box mb={3}>
                        <Accordion
                            expanded={expanded === 'add'}
                            onChange={handleAccordionChange('add')}
                            sx={{
                                boxShadow: theme.shadows[1],
                                borderRadius: '8px',
                                mb: 2,
                                '&:before': { display: 'none' },
                            }}
                        >
                            <StyledAccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="add-content"
                                id="add-header"
                            >
                                <Box display="flex" alignItems="center" gap={1}>
                                    <AddIcon color="primary" />
                                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                        Add Users
                                    </Typography>
                                </Box>
                            </StyledAccordionSummary>
                            <AccordionDetails>
                                {rolesConfig.map(({ role, label, allowedRoles, idField }) => (
                                    <RoleBasedComponent key={role} allowedRoles={allowedRoles}>
                                        <Box sx={{ minWidth: 180, mb: 2 }}>
                                            <MultiSelectWithCheckboxesNoSelect
                                                label={label}
                                                fetchData={fetchDataFunctions[role]}
                                                onSelect={(selectedItems) =>
                                                    handleRoleInputChange(role, selectedItems)
                                                }
                                                getOptionLabel={(option) =>
                                                    `${option.firstName} ${option.lastName}`
                                                }
                                                placeholder={`Search ${label}`}
                                                hideSelected
                                                initialValue={[]}
                                                idField={idField}
                                                width="100%"
                                            />
                                        </Box>
                                    </RoleBasedComponent>
                                ))}
                            </AccordionDetails>
                        </Accordion>
                        <Divider sx={{ my: 2 }} />
                    </Box>
                )}

                {/* Assigned Users Accordion */}
                <Accordion
                    expanded={expanded === 'table'}
                    onChange={handleAccordionChange('table')}
                    sx={{
                        boxShadow: theme.shadows[1],
                        borderRadius: '8px',
                        '&:before': { display: 'none' },
                    }}
                >
                    <StyledAccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="table-content"
                        id="table-header"
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <VisibilityIcon color="secondary" />
                            <Typography variant="subtitle1" fontWeight="bold" color="secondary">
                                Assigned Users
                            </Typography>
                        </Box>
                    </StyledAccordionSummary>
                    <AccordionDetails>
                        {/* Search and Filter Controls */}
                        <Box display="flex" gap={2} alignItems="center" mb={2} mt={2}>
                            <TextField
                                label="Search by Name"
                                variant="outlined"
                                value={filter}
                                onChange={(e) => {
                                    setFilter(e.target.value);
                                    setPage(0); // Reset to first page when filter changes
                                }}
                                sx={{ width: '70%' }}
                            />
                            <FormControl sx={{ width: '30%' }}>
                                <InputLabel>Filter by Role</InputLabel>
                                <Select
                                    value={selectedRole}
                                    onChange={(e) => {
                                        setSelectedRole(e.target.value);
                                        setPage(0); // Reset to first page when role filter changes
                                    }}
                                    label="Filter by Role"
                                >
                                    <MenuItem value="All">All</MenuItem>
                                    {allowedRolesForFilter.map(({ role }) => (
                                        <MenuItem key={role} value={role}>
                                            {role}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Active Filters Display */}
                        {(filter || (selectedRole && selectedRole !== 'All')) && (
                            <Box display="flex" gap={1} alignItems="center" mb={2}>
                                <Typography variant="subtitle1">Active Filters:</Typography>
                                {filter && (
                                    <Chip
                                        label={`Search: "${filter}"`}
                                        onDelete={() => {
                                            setFilter('');
                                        }}
                                        color="primary"
                                        variant="outlined"
                                    />
                                )}
                                {selectedRole && selectedRole !== 'All' && (
                                    <Chip
                                        label={`Role: ${selectedRole}`}
                                        onDelete={() => {
                                            setSelectedRole('All');
                                        }}
                                        color="primary"
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        )}

                        {/* Users Table */}
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Role</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                <CircularProgress size={24} />
                                            </TableCell>
                                        </TableRow>
                                    ) : assignees.length > 0 ? (
                                        assignees.map((user, index, array) => {
                                            const isLastInRole =
                                                index === array.length - 1 ||
                                                user.roles[0] !== array[index + 1]?.roles[0];

                                            return (
                                                <React.Fragment key={user.userId || user.id}>
                                                    <TableRow>
                                                        <TableCell>{user.roles.join(', ')}</TableCell>
                                                        <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                size="small"
                                                                color="secondary"
                                                                onClick={() => handleRemoveUser(user.roles[0], user)}
                                                                aria-label={`remove ${user.firstName} ${user.lastName}`}
                                                            >
                                                                <CloseIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                    {isLastInRole && (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={4}
                                                                sx={{
                                                                    borderBottom: '3px solid #ccc',
                                                                    padding: 0,
                                                                }}
                                                            />
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination Controls */}
                        <TablePagination
                            component="div"
                            count={total}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            labelRowsPerPage="Rows per page:"
                            sx={{ mt: 2 }}
                        />
                    </AccordionDetails>
                </Accordion>

                {/* Snackbar for Notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                        variant="filled"
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={async () => {
                        if (!selectedCustomTodoId) return;

                        // Extract user IDs based on roles
                        const allSelectedUserIds = assignees.map((user) =>
                            user.userId ? user.userId : user.id
                        );

                        try {
                            await assignToDoToUsers(selectedCustomTodoId, allSelectedUserIds);
                            setSnackbar({
                                open: true,
                                message: 'ToDo successfully assigned to users',
                                severity: 'success',
                            });
                            onSave();
                            onClose();
                        } catch (error) {
                            setSnackbar({
                                open: true,
                                message: 'Error assigning ToDo to users',
                                severity: 'error',
                            });
                            console.error('Error assigning ToDo to users:', error);
                        }
                    }}
                    color="primary"
                    variant="contained"
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CustomRoleDialog;

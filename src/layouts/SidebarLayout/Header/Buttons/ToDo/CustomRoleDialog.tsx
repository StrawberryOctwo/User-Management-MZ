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
import { fetchAssignedUsersForTodo, removeUserFromToDo } from 'src/services/todoService';
import { styled, alpha, useTheme } from '@mui/material/styles';
import UsersTable from './UsersTable';
import ConfirmationDialog from 'src/components/Calendar/Components/Modals/ConfirmationDialog';

interface User {
    id?: number;
    userId?: number;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    completed: boolean;
}

interface UserToRemove {
    user: User;
    role: string;
    isNewlySelected: boolean;
}

interface CustomRoleDialogProps {
    open: boolean;
    onClose: () => void;
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
    const [newlySelectedUsers, setNewlySelectedUsers] = useState<User[]>([]);
    const [userToRemove, setUserToRemove] = useState<UserToRemove | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [initialAssignees, setInitialAssignees] = useState<User[]>([]);
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
    const fetchInitialAssignees = async () => {
        if (!selectedCustomTodoId) return;

        setLoading(true);
        try {
            const data = await fetchAssignedUsersForTodo(selectedCustomTodoId, {
                search: filter,
                role: selectedRole !== 'All' ? selectedRole : '',
                page: page + 1,
                limit: rowsPerPage,
            });

            const uniqueAssignees = data.assignees.reduce((acc: User[], current: User) => {
                const currentId = current.userId || current.id;
                const exists = acc.some(user => (user.userId || user.id) === currentId);
                if (!exists) {
                    acc.push(current);
                }
                return acc;
            }, []);

            setInitialAssignees(uniqueAssignees);
            setTotal(uniqueAssignees.length);
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
            fetchInitialAssignees();
        }
    }, [open, selectedCustomTodoId, filter, selectedRole, page, rowsPerPage]);

    useEffect(() => {
        if (!open) {
            setNewlySelectedUsers([]);
        }
    }, [open]);

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


    const handleRoleInputChange = (role: string, selectedItems: User[]) => {
        const newUsers = selectedItems.map(user => ({
            ...user,
            roles: [role],
            completed: false
        }));

        setNewlySelectedUsers(prev => {
            // Create a map of existing users for quick lookup
            const existingUsersMap = new Map(
                prev.map(user => [(user.userId || user.id)?.toString(), user])
            );

            // Add new users while preserving existing ones
            newUsers.forEach(newUser => {
                const newUserId = (newUser.userId || newUser.id)?.toString();
                if (newUserId && !existingUsersMap.has(newUserId)) {
                    existingUsersMap.set(newUserId, newUser);
                }
            });

            return Array.from(existingUsersMap.values());
        });
    };

    const filterOutAssignedUsers = async (role: string, fetchFunction: (query: string) => Promise<any[]>, query: string) => {
        try {
            const fetchedUsers = await fetchFunction(query);
            // Filter out users that are in either initialAssignees or newlySelectedUsers
            return fetchedUsers.filter(fetchedUser => {
                const fetchedUserId = fetchedUser.userId || fetchedUser.id;
                const isInInitialAssignees = initialAssignees.some(assignedUser =>
                    (assignedUser.userId || assignedUser.id) === fetchedUserId
                );
                const isInNewlySelected = newlySelectedUsers.some(selectedUser =>
                    (selectedUser.userId || selectedUser.id) === fetchedUserId
                );
                return !isInInitialAssignees && !isInNewlySelected;
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    };

    const handleRemoveUser = (role: string, user: User, isNewlySelected: boolean) => {
        setUserToRemove({ user, role, isNewlySelected });
        setConfirmOpen(true);
    };

    const handleConfirmRemove = async () => {
        if (!userToRemove || !selectedCustomTodoId) return;

        const { user, isNewlySelected } = userToRemove;
        const userId = user.userId || user.id;

        try {
            if (!isNewlySelected) {
                // Only call API for already assigned users
                await removeUserFromToDo(selectedCustomTodoId, userId);
            }

            // Update local state
            if (isNewlySelected) {
                setNewlySelectedUsers(prevUsers =>
                    prevUsers.filter(currentUser =>
                        (currentUser.userId || currentUser.id) !== userId
                    )
                );
            } else {
                setInitialAssignees(prevUsers =>
                    prevUsers.filter(currentUser =>
                        (currentUser.userId || currentUser.id) !== userId
                    )
                );
            }
        } catch (error) {
            console.error('Error removing user:', error);
        } finally {
            setConfirmOpen(false);
            setUserToRemove(null);
        }
    };

    const handleCloseConfirm = () => {
        setConfirmOpen(false);
        setUserToRemove(null);
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
                    <>
                        {/* Add Users Accordion */}
                        <Box mb={3}>
                            <Accordion
                                sx={{
                                    boxShadow: theme.shadows[1],
                                    borderRadius: '8px',
                                    mb: 2,
                                    '&:before': { display: 'none' },
                                }}
                                defaultExpanded
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
                                                    fetchData={(query) => filterOutAssignedUsers(role, fetchDataFunctions[role], query)}
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
                        </Box>

                        {/* Newly Selected Users Accordion */}
                        <Accordion
                            sx={{
                                boxShadow: theme.shadows[1],
                                borderRadius: '8px',
                                '&:before': { display: 'none' },
                            }}
                            defaultExpanded
                        >
                            <StyledAccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="new-users-content"
                                id="new-users-header"
                            >
                                <Box display="flex" alignItems="center" gap={1}>
                                    <VisibilityIcon color="secondary" />
                                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                        Newly Selected Users
                                    </Typography>
                                </Box>
                            </StyledAccordionSummary>
                            <AccordionDetails>
                                <UsersTable
                                    users={newlySelectedUsers}
                                    loading={loading}
                                    isNewlySelected={true}
                                    onRemoveUser={handleRemoveUser}
                                />
                            </AccordionDetails>
                        </Accordion>
                    </>
                )}


                {originName === 'ViewAssignees' && (
                    <Box>
                        <Box display="flex" gap={2} alignItems="center" mb={2} mt={2}>
                            <TextField
                                label="Search by Name"
                                variant="outlined"
                                value={filter}
                                onChange={(e) => {
                                    setFilter(e.target.value);
                                    setPage(0);
                                }}
                                sx={{ width: '70%' }}
                            />
                            <FormControl sx={{ width: '30%' }}>
                                <InputLabel>Filter by Role</InputLabel>
                                <Select
                                    value={selectedRole}
                                    onChange={(e) => {
                                        setSelectedRole(e.target.value);
                                        setPage(0);
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

                        <UsersTable
                            users={initialAssignees}
                            loading={loading}
                            isNewlySelected={false}
                            onRemoveUser={handleRemoveUser}
                        />

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
                    </Box>
                )}

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
                {originName === 'AssignRole' && (
                    <Button
                        onClick={async () => {
                            if (!selectedCustomTodoId) return;

                            // Combine initial and newly selected users
                            const allUsers = [...initialAssignees, ...newlySelectedUsers];
                            const allSelectedUserIds = allUsers.map(user => user.userId || user.id);

                            try {
                                await assignToDoToUsers(selectedCustomTodoId, allSelectedUserIds);
                                setSnackbar({
                                    open: true,
                                    message: 'ToDo successfully assigned to users',
                                    severity: 'success'
                                });
                                onSave();
                                onClose();
                            } catch (error) {
                                setSnackbar({
                                    open: true,
                                    message: 'Error assigning ToDo to users',
                                    severity: 'error'
                                });
                                console.error('Error assigning ToDo to users:', error);
                            }
                        }}
                        color="primary"
                        variant="contained"
                    >
                        Save
                    </Button>
                )}
            </DialogActions>

            <ConfirmationDialog
                open={confirmOpen}
                onClose={handleCloseConfirm}
                onConfirm={handleConfirmRemove}
                title="Confirm Remove User"
                content={userToRemove ? `Are you sure you want to remove ${userToRemove.user.firstName} ${userToRemove.user.lastName}?` : ''}
                confirmButtonText="Remove"
                confirmButtonColor="error"
            />
        </Dialog>
    );
};

export default CustomRoleDialog;

// CustomRoleDialog.tsx
import React from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    IconButton,
} from '@mui/material';
import RoleBasedComponent from 'src/components/ProtectedComponent';
import MultiSelectWithCheckboxesNoSelect from 'src/components/SearchBars/MultiSelectWithCkeckboxesNoSelect';

interface CustomRoleDialogProps {
    open: boolean;
    onClose: () => void;
    selectedUsers: any;
    handleRoleInputChange: (role: string, selectedItems: any[]) => void;
    handleRemoveUser: (role: string, user: any) => void;
    assignToDoToUsers: (todoId: number | null, userIds: number[]) => Promise<void>;
    selectedCustomTodoId: number | null;
    fetchDataFunctions: { [role: string]: (query: string) => Promise<any[]> };
}

const CustomRoleDialog: React.FC<CustomRoleDialogProps> = ({
    open,
    onClose,
    selectedUsers,
    handleRoleInputChange,
    handleRemoveUser,
    assignToDoToUsers,
    selectedCustomTodoId,
    fetchDataFunctions,
}) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Assign Custom Roles</DialogTitle>
            <DialogContent dividers>
                {['FranchiseAdmin', 'LocationAdmin', 'Teacher', 'Student'].map((role) => {
                    const labelMap: { [key: string]: string } = {
                        FranchiseAdmin: 'Franchise Admins',
                        LocationAdmin: 'Location Admins',
                        Teacher: 'Teachers',
                        Student: 'Students',
                    };
                    const allowedRolesMap: { [key: string]: string[] } = {
                        FranchiseAdmin: ['SuperAdmin'],
                        LocationAdmin: ['FranchiseAdmin'],
                        Teacher: ['FranchiseAdmin', 'LocationAdmin'],
                        Student: ['FranchiseAdmin', 'LocationAdmin', 'Teacher'],
                    };

                    return (
                        <RoleBasedComponent key={role} allowedRoles={allowedRolesMap[role]}>
                            <Box sx={{ minWidth: 180, mb: 2 }}>
                                <MultiSelectWithCheckboxesNoSelect
                                    label={labelMap[role]}
                                    fetchData={fetchDataFunctions[role]}
                                    onSelect={(selectedItems) => handleRoleInputChange(role, selectedItems)}
                                    displayProperty="firstName"
                                    placeholder={`Type to search ${role.toLowerCase()}`}
                                    hideSelected
                                    initialValue={selectedUsers[role]}
                                />
                            </Box>
                        </RoleBasedComponent>
                    );
                })}

                <Box mt={3}>
                    <Typography variant="h6">Selected Users:</Typography>
                    {Object.keys(selectedUsers).map((role) =>
                        selectedUsers[role].length > 0 && (
                            <Box key={role} mt={1}>
                                <Typography variant="subtitle1">{role}:</Typography>
                                <Box pl={2}>
                                    {selectedUsers[role].map((user) => (
                                        <Box
                                            key={user.id}
                                            display="flex"
                                            alignItems="center"
                                            sx={{
                                                position: 'relative',
                                                '&:hover .remove-btn': { visibility: 'visible' },
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ mr: 1 }}>
                                                - {user.firstName} {user.lastName}
                                            </Typography>
                                            <IconButton
                                                className="remove-btn"
                                                size="small"
                                                color="secondary"
                                                onClick={() => handleRemoveUser(role, user)}
                                                sx={{
                                                    visibility: 'hidden',
                                                }}
                                            >
                                                &times;
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button
                    onClick={async () => {
                        const allSelectedUserIds = Object.entries(selectedUsers).flatMap(([role, users]) =>
                            (users as any[]).map((user) =>
                                role === 'Teacher' || role === 'Student' ? user.userId : user.id
                            )
                        );
                        try {
                            await assignToDoToUsers(selectedCustomTodoId, allSelectedUserIds);
                            console.log('ToDo successfully assigned to users');
                        } catch (error) {
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

// UsersTable.tsx
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    IconButton,
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface User {
    id?: number;
    userId?: number;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    completed: boolean;
}

interface UsersTableProps {
    users: User[];
    loading: boolean;
    isNewlySelected?: boolean;
    onRemoveUser: (role: string, user: User, isNewlySelected: boolean) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
    users,
    loading,
    isNewlySelected = false,
    onRemoveUser,
}) => {
    return (
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
                    ) : users.length > 0 ? (
                        users.map((user, index, array) => {
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
                                                onClick={() => onRemoveUser(user.roles[0], user, isNewlySelected)}
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
    );
};

export default UsersTable;
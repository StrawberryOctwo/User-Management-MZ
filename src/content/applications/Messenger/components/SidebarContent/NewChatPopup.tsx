import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import { fetchFranchiseAdmins } from 'src/services/franchiseAdminService';
import { fetchLocationAdmins } from 'src/services/locationAdminService';
import { fetchTeachers } from 'src/services/teacherService';
import { createOrGetChatRoom } from 'src/services/chatService';
import ConfirmationDialog from 'src/components/Calendar/Components/Modals/ConfirmationDialog';
import { fetchStudents } from 'src/services/studentService';
import { fetchParents } from 'src/services/parentService';

import { useAuth } from 'src/hooks/useAuth';

interface User {
  id: number;
  name: string;
  email: string;
}

interface NewChatPopupProps {
  open: boolean;
  onClose: () => void;
  onSelectUser: (user: User, roomId: string) => void;
}

const userTypes = [
  { id: 'FranchiseAdmin', label: 'Franchise Admin', icon: '🏢' },
  { id: 'LocationAdmin', label: 'Location Admin', icon: '📍' },
  { id: 'Teacher', label: 'Teacher', icon: '👩‍🏫' },
  { id: 'Student', label: 'Student', icon: '👩‍🏫' },
  { id: 'Parent', label: 'Parent', icon: '👩‍🏫' }
];

const fetchUsersByType = async (type: string, query: string) => {
  const page = 1;
  const limit = 10;

  try {
    let response;
    switch (type) {
      case 'FranchiseAdmin':
        response = await fetchFranchiseAdmins(page, limit, query);
        break;
      case 'LocationAdmin':
        response = await fetchLocationAdmins(page, limit, query);
        break;
      case 'Teacher':
        response = await fetchTeachers(page, limit, query);
        break;
      case 'Student':
        response = await fetchStudents(page, limit, query);
        break;
      case 'Parent':
        response = await fetchParents(page, limit, query);
        break;
      default:
        throw new Error('Invalid user type');
    }

    // Transform the response data to match expected format
    const transformedData = response.data.map(item => ({
      id: type === 'Teacher' || type === 'Student' ? item.userId : (type === 'Parent' ? item.user.id : item.id),
      name: `${item.firstName} ${item.lastName}`,
      email: item.email,
      postalCode: item.postalCode,
      phoneNumber: item.phoneNumber
    }));

    return {
      data: transformedData,
      total: response.total || 0
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

const steps = ['Select User Type', 'Select User'];

const NewChatPopup: React.FC<NewChatPopupProps> = ({
  open,
  onClose,
  onSelectUser
}) => {
  const { userId, userRoles } = useAuth();
  const filteredUserTypes = userTypes.filter((type) => {
    if (userRoles.includes('Student') || userRoles.includes('Parent')) {
      return !['Student', 'Parent'].includes(type.id);
    }
    return true;
  });
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userOptions, setUserOptions] = useState<User[]>([]);
  const [creatingRoom, setCreatingRoom] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  useEffect(() => {
    if (activeStep === 1 && selectedUserType) {
      // Reset state when changing steps
      setUserOptions([]);
      setError(null);
    }
  }, [activeStep, selectedUserType]);

  const handleUserTypeSelect = (typeId: string) => {
    setSelectedUserType(typeId);
    setActiveStep(1);
    setError(null);
  };

  const handleUserSelect = async (user: User) => {
    setPendingUser(user);
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setPendingUser(null);
  };

  const handleConfirmCreateRoom = async () => {
    if (!pendingUser) return;

    setConfirmOpen(false);
    setSelectedUser(pendingUser);
    setCreatingRoom(true);
    setError(null);

    try {
      const chatRoom = await createOrGetChatRoom(pendingUser.id);
      onSelectUser(pendingUser, chatRoom.id);
      handleClose();
    } catch (err: any) {
      console.error("Error creating or fetching chat room:", err);

      setError(err.message);
      setCreatingRoom(false);
      setSelectedUser(null);
    } finally {
      setPendingUser(null);
    }
  };


  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setSelectedUserType(null);
    setSelectedUser(null);
    setError(null);
  };

  const handleClose = () => {
    setActiveStep(0);
    setSelectedUserType(null);
    setSelectedUser(null);
    setError(null);
    onClose();
  };

  const handleFetchUsers = async (query: string) => {
    if (!selectedUserType) return [];
    setLoading(true);
    setError(null);

    try {
      const response = await fetchUsersByType(selectedUserType, query);
      setUserOptions(response.data);
      setLoading(false);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred while fetching users.';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  };

  const getUserTypeLabel = () => {
    const type = filteredUserTypes.find(type => type.id === selectedUserType);
    return type ? type.label : '';
  };



  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" onBackdropClick={() => !creatingRoom && handleClose()}>
        <DialogTitle>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </DialogTitle>
        <DialogContent dividers>
          {activeStep === 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Select User Type to Chat
              </Typography>
              <List>
                {filteredUserTypes.map((type) => (
                  <ListItem
                    button
                    key={type.id}
                    onClick={() => handleUserTypeSelect(type.id)}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {type.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={type.label} />
                  </ListItem>
                ))}
              </List>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button onClick={handleClose} color="primary" variant="outlined">
                  Cancel
                </Button>
              </Box>
            </>
          )}
          {activeStep === 1 && (
            <>
              <Box display="flex" alignItems="center" mb={2}>
                <Button onClick={handleBack} color="secondary" variant="text">
                  &larr; Back
                </Button>
                <Typography variant="h6" component="div" ml={2}>
                  Select a {getUserTypeLabel()}
                </Typography>
              </Box>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <SingleSelectWithAutocomplete
                ref={null}
                label={`Search ${getUserTypeLabel()}`}
                fetchData={handleFetchUsers}
                onSelect={handleUserSelect}
                displayProperty="name"
                placeholder={`Type to search ${getUserTypeLabel().toLowerCase()}s`}
              />
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button onClick={handleClose} color="primary" variant="outlined">
                  Cancel
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        )}
      </Dialog>
      <ConfirmationDialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmCreateRoom}
        title="Create Chat Room"
        content={`Are you sure you want to create a chat room with ${pendingUser?.name}?`}
        confirmButtonText="Create"
        confirmButtonColor="primary"
      />
    </>
  );
};

export default NewChatPopup;
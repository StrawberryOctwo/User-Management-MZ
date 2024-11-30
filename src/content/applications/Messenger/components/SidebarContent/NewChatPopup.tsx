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

interface NewChatPopupProps {
  open: boolean;
  onClose: () => void;
  onSelectUser: (user: any) => void;
}

const userTypes = [
  { id: 'franchiseAdmin', label: 'Franchise Admin', icon: '🏢' },
  { id: 'locationAdmin', label: 'Location Admin', icon: '📍' },
  { id: 'teacher', label: 'Teacher', icon: '👩‍🏫' },
  { id: 'parent', label: 'Parent', icon: '👨‍👩‍👧' },
  { id: 'student', label: 'Student', icon: '🎓' }
];

// Mock fetch functions for different user types
const fetchUsersByType = (type: string, query: string) => {
  // Replace this with actual API calls based on user type
  return new Promise<{ data: any[] }>((resolve, reject) => {
    setTimeout(() => {
      // Simulate error for demonstration
      if (Math.random() < 0.1) {
        reject(new Error('Failed to fetch users.'));
      } else {
        const allUsers = {
          franchiseAdmin: [
            { id: 1, name: 'John Doe', email: 'john@franchise.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@franchise.com' }
          ],
          locationAdmin: [
            { id: 3, name: 'Alice Johnson', email: 'alice@location.com' },
            { id: 4, name: 'Bob Brown', email: 'bob@location.com' }
          ],
          teacher: [
            { id: 5, name: 'Charlie Davis', email: 'charlie@school.com' },
            { id: 6, name: 'Dana Lee', email: 'dana@school.com' }
          ],
          parent: [
            { id: 7, name: 'Evan Green', email: 'evan@parent.com' },
            { id: 8, name: 'Fiona White', email: 'fiona@parent.com' }
          ],
          student: [
            { id: 9, name: 'George King', email: 'george@student.com' },
            { id: 10, name: 'Hannah Scott', email: 'hannah@student.com' }
          ]
        };
        const filtered = allUsers[type].filter(user =>
          user.name.toLowerCase().includes(query.toLowerCase())
        );
        resolve({ data: filtered });
      }
    }, 1000);
  });
};

const steps = ['Select User Type', 'Select User'];

const NewChatPopup: React.FC<NewChatPopupProps> = ({
  open,
  onClose,
  onSelectUser
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userOptions, setUserOptions] = useState<any[]>([]);

  useEffect(() => {
    if (activeStep === 1 && selectedUserType) {
      // Optionally prefetch users or handle side effects here
    }
  }, [activeStep, selectedUserType]);

  const handleUserTypeSelect = (typeId: string) => {
    setSelectedUserType(typeId);
    setActiveStep(1);
    setError(null);
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    onSelectUser(user);
    handleClose();
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
      setError(err.message || 'An error occurred while fetching users.');
      setLoading(false);
      return [];
    }
  };

  const getUserTypeLabel = () => {
    const type = userTypes.find(type => type.id === selectedUserType);
    return type ? type.label : '';
  };

  const getUserTypeIcon = () => {
    const type = userTypes.find(type => type.id === selectedUserType);
    return type ? type.icon : '👤';
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
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
              {userTypes.map((type) => (
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
              ref={null} // Replace with actual ref if needed
              label={`Search and assign ${getUserTypeLabel()}`}
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
  );
};

export default NewChatPopup;

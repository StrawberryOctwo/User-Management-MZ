import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';

type SnackbarContextType = {
  showMessage: (message: string, severity: 'success' | 'error') => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

// Custom styled Alert component with white icon and dynamic background color
const CustomAlert = styled(Alert)<{ severity: 'success' | 'error' }>(({ theme, severity }) => ({
  fontSize: '1.2rem', // Larger font size
  fontWeight: 'bold', // Bold font
  backgroundColor: severity === 'success' ? theme.palette.success.main : theme.palette.error.main, // Green for success, red for error
  color: theme.palette.common.white, // White text for both cases
  boxShadow: theme.shadows[4], // Add some shadow for depth
  borderRadius: '8px', // Rounded corners
  padding: theme.spacing(2), // Add padding for larger size
  maxWidth: '600px', // Make the snackbar wider
  textAlign: 'center', // Center text
  '& .MuiAlert-icon': {
    color: theme.palette.common.white, // Make the icon white regardless of severity
  },
}));

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error'>('success');

  const showMessage = (msg: string, sev: 'success' | 'error') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000} // Keep it visible for 4 seconds
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Bottom-center position
        sx={{ bottom: '20px' }} // Move slightly up from the bottom
        TransitionProps={{
          onExited: handleClose,
        }}
      >
        <CustomAlert onClose={handleClose} severity={severity}>
          {message}
        </CustomAlert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';

type SnackbarContextType = {
  showMessage: (message: string, severity: 'success' | 'error') => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

const CustomAlert = styled(Alert)<{ severity: 'success' | 'error' }>(
  ({ theme, severity }) => ({
    fontSize: 16, 
    fontWeight: 'regular',
    backgroundColor: theme.palette[severity].main,
    color: theme.palette.common.white,
    boxShadow: theme.shadows[4],
    borderRadius: 7,
    padding: theme.spacing(1),
    maxWidth: 400, // Maximum width
    minWidth: 200, // Minimum width (for responsiveness)
    maxHeight: 150, // Maximum height
    minHeight:50,
    textAlign: 'center',
    '& .MuiAlert-icon': { color: theme.palette.common.white },
  })
);



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

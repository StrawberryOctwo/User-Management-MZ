import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error'; // Restrict severity to valid options

type SnackbarContextType = {
  showMessage: (
    message: string,
    severity: SnackbarSeverity,
    duration?: number // Optional duration for Snackbar visibility
  ) => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

const CustomAlert = styled(Alert)<{ severity: SnackbarSeverity }>(
  ({ theme, severity }) => ({
    fontSize: 16,
    fontWeight: 'regular',
    backgroundColor: theme.palette[severity].main, // Dynamic background based on severity
    color: theme.palette.common.white,
    boxShadow: theme.shadows[4],
    borderRadius: 7,
    padding: theme.spacing(1),
    maxWidth: 400,
    minWidth: 200,
    maxHeight: 150,
    minHeight: 50,
    textAlign: 'center',
    '& .MuiAlert-icon': { color: theme.palette.primary.contrastText },
  })
);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<SnackbarSeverity>('success');
  const [duration, setDuration] = useState(4000); // Default duration for Snackbar visibility
  const [alertColor, setAlertColor] = useState<string>(''); // Add state for custom color

  const theme = useTheme(); // Access theme for dynamic colors
  
  const showMessage = (
    msg: string,
    sev: SnackbarSeverity,
    dur: number = 4000 // Default duration is 4000ms
  ) => {
    setMessage(msg);
    setSeverity(sev);
    setDuration(dur);
    setAlertColor(theme.palette[sev].main); // Set color dynamically based on severity
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
        autoHideDuration={duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: '20px' }}
        TransitionProps={{
          onExited: handleClose,
        }}
      >
        <CustomAlert
          onClose={handleClose}
          severity={severity}
          sx={{
            backgroundColor: (theme) =>
              theme.palette[severity].main,
            color: (theme) =>
              theme.palette.primary.contrastText
          
          }}
        >
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

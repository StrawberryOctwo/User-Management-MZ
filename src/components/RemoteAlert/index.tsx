// src/components/RemoteAlert.tsx
import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, CircularProgress, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

interface AlertData {
  showAlert: boolean;
  message: string;
}

const RemoteAlert: React.FC = () => {
  const [alertData, setAlertData] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState<boolean>(true);

  // Your JSONBin.io URL
  const ALERT_API_URL = 'https://api.jsonbin.io/v3/b/673d221cad19ca34f8ccde8d';

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const response = await axios.get(ALERT_API_URL, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        // Access the 'record' field in the response
        const data = response.data.record;
        if (data && data.showAlert) {
          setAlertData({ showAlert: data.showAlert, message: data.message });
        } else {
          setAlertData(null);
        }
      } catch (err) {
        console.error('Error fetching alert:', err);
        setError('Failed to load alert.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlert();
  }, [ALERT_API_URL]);

  // Automatically dismiss the alert after 5 seconds
  useEffect(() => {
    if (alertData && alertData.showAlert && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 15000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [alertData, visible]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="flex-start" alignItems="center" my={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={2}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  if (alertData && alertData.showAlert && visible) {
    return (
      <Box my={2}>
        <Alert
          severity="info"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setVisible(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{
            width: '100%', // Ensures the alert takes the full width of its container
          }}
        >
          <AlertTitle>Notice</AlertTitle>
          {alertData.message}
        </Alert>
      </Box>
    );
  }

  return null;
};

export default RemoteAlert;

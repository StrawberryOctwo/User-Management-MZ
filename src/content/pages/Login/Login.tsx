import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { login } from 'src/services/authService';
import { isAuthenticated } from 'src/services/authService'; // Check token logic
import { useWebSocket } from 'src/utils/webSocketProvider';
import { t } from 'i18next';

const Login: React.FC = () => {
  const socket = useWebSocket();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isMounted = useRef(true); // Track if component is mounted

  useEffect(() => {
    isMounted.current = true; // Mark as mounted when the component is mounted

    // Check if the user is already authenticated
    if (isAuthenticated()) {
      navigate('/dashboard'); // Redirect to dashboard if token is valid
    }

    return () => {
      isMounted.current = false; // Cleanup: mark as unmounted on component unmount
    };
  }, [navigate]); // `navigate` is a dependency here to avoid stale references

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      if (isMounted.current) {
        if (response?.status === 200) {
          socket.connect();
          navigate('/dashboard'); // Only navigate if login is successful
        }
      }
    } catch (err) {
      if (isMounted.current) setError('Error during login');
    } finally {
      if (isMounted.current) setLoading(false); // Avoid state update if unmounted
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Paper variant="outlined" sx={{ padding: 4, width: '100%' }}>
        <Typography variant="h4" align="left" gutterBottom>
          Login
        </Typography>

        <form onSubmit={handleLogin}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <TextField
              label={t("email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label={t("password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;

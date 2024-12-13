import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  ListItem,
  List,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputAdornment,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { updateUserPassword } from 'src/services/userService';
import { t } from "i18next"

// Password Change Modal Component
const PasswordChangeModal = ({ open, onClose }) => {
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
  };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswords = () => {
    if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    if (passwords.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePasswords()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateUserPassword(passwords.oldPassword, passwords.newPassword);
      setSuccess('Password updated successfully');
      setTimeout(() => {
        onClose();
        setPasswords({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordField = (
    label: string,
    field: 'oldPassword' | 'newPassword' | 'confirmPassword',
    showField: 'old' | 'new' | 'confirm'
  ) => (
    <TextField
      fullWidth
      type={showPasswords[showField] ? 'text' : 'password'}
      label={label}
      value={passwords[field]}
      onChange={handleChange(field)}
      margin="normal"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => togglePasswordVisibility(showField)} edge="end">
              {showPasswords[showField] ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        )
      }}
    />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {renderPasswordField('Current Password', 'oldPassword', 'old')}
          {renderPasswordField('New Password', 'newPassword', 'new')}
          {renderPasswordField('Confirm New Password', 'confirmPassword', 'confirm')}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {t("cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Updated SecurityTab Component
function SecurityTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box pb={2}>
          <Typography variant="h3">Security</Typography>
          <Typography variant="subtitle2">
            Manage your account security settings
          </Typography>
        </Box>
        <Card>
          <List>
            <ListItem sx={{ p: 3 }}>
              <ListItemText
                primaryTypographyProps={{ variant: 'h5', gutterBottom: true }}
                secondaryTypographyProps={{
                  variant: 'subtitle2',
                  lineHeight: 1
                }}
                primary="Change Password"
                secondary="You can change your password to secure your account"
              />
              <Button
                size="large"
                variant="outlined"
                onClick={() => setIsModalOpen(true)}
              >
                Change Password
              </Button>
            </ListItem>
          </List>
        </Card>
      </Grid>

      <PasswordChangeModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Grid>
  );
}

export default SecurityTab;
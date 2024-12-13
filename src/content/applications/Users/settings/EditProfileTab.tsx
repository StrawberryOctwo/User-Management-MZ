import { Grid, Typography, Card, Box, Divider, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DoneTwoToneIcon from '@mui/icons-material/DoneTwoTone';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import ParentDetails from './ParentDetails';
import TeacherDetails from './TeacherDetails';
import UserDetails from './UserDetails';
import { fetchUserProfile, updateUserProfile } from 'src/services/userService';
import { useTranslation } from 'react-i18next';

function EditProfileTab() {
  const [isEditingUser, setIsEditingUser] = useState(false); // State for User Details
  const [isEditingParent, setIsEditingParent] = useState(false); // State for Parent Details
  const [isEditingTeacher, setIsEditingTeacher] = useState(false); // State for Teacher Details
  const [user, setUser] = useState<any>({});
  const [userRole, setUserRole] = useState<string>('');
  const { t } = useTranslation(); 
  const handleUserEditToggle = async () => {
    if (isEditingUser) {
      await handleSaveUser();
    }
    setIsEditingUser(!isEditingUser);
  };

  const handleParentEditToggle = async () => {
    if (isEditingParent) {
      await handleSaveUser();
    }
    setIsEditingParent(!isEditingParent);
  };

  const handleTeacherEditToggle = async () => {
    if (isEditingTeacher) {
      await handleSaveUser();
    }
    setIsEditingTeacher(!isEditingTeacher);
  };

  const handleSaveUser = async () => {
    try {
      await updateUserProfile(user);
      
    } catch (error) {
      console.error('Failed to update user profile:', error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const user = await fetchUserProfile();
      setUser(user.data);
      setUserRole(user.data.role);
    };

    fetchUser();
  }, []);

  return (
    <Grid container spacing={3}>
      {/* General User Details */}
      <Grid item xs={12}>
        <Card>
          <Box
            p={3}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h4" gutterBottom>
                {t('user_details')}
              </Typography>
              <Typography variant="subtitle2">
                Manage information related to your personal details
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              {isEditingUser && (
                <Button
                  variant="text"
                  color="error"
                  startIcon={<CancelTwoToneIcon />}
                  onClick={() => setIsEditingUser(false)}
                >
                  {t("(cancel")}
                </Button>
              )}
              <Button
                variant="text"
                startIcon={
                  isEditingUser ? <DoneTwoToneIcon /> : <EditTwoToneIcon />
                }
                onClick={handleUserEditToggle}
              >
                {isEditingUser ? '{t("(save")}' : 'Edit'}
              </Button>
            </Box>
          </Box>
          <Divider />
          <UserDetails
            user={user}
            isEditing={isEditingUser}
            setUser={setUser}
          />
        </Card>
      </Grid>

      {/* Role-Specific Details */}
      {userRole === 'Parent' && (
        <Grid item xs={12}>
          <Card>
            <Box
              p={3}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h4">Parent Account Details</Typography>
              <Box display="flex" gap={1}>
                {isEditingParent && (
                  <Button
                    variant="text"
                    color="error"
                    startIcon={<CancelTwoToneIcon />}
                    onClick={() => setIsEditingParent(false)}
                  >
                    {t("(cancel")}
                  </Button>
                )}
                <Button
                  variant="text"
                  startIcon={
                    isEditingParent ? <DoneTwoToneIcon /> : <EditTwoToneIcon />
                  }
                  onClick={handleParentEditToggle}
                >
                  {isEditingParent ? '{t("(save")}' : 'Edit'}
                </Button>
              </Box>
            </Box>
            <Divider />
            <ParentDetails
              user={user}
              isEditing={isEditingParent}
              setUser={setUser}
            />
          </Card>
        </Grid>
      )}

      {userRole === 'Teacher' && (
        <Grid item xs={12}>
          <Card>
            <Box
              p={3}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h4">
                Teacher Professional Information
              </Typography>
              <Box display="flex" gap={1}>
                {isEditingTeacher && (
                  <Button
                    variant="text"
                    color="error"
                    startIcon={<CancelTwoToneIcon />}
                    onClick={() => setIsEditingTeacher(false)}
                  >
                    {t("(cancel")}
                  </Button>
                )}
                <Button
                  variant="text"
                  startIcon={
                    isEditingTeacher ? <DoneTwoToneIcon /> : <EditTwoToneIcon />
                  }
                  onClick={handleTeacherEditToggle}
                >
                  {isEditingTeacher ? '{t("(save")}' : 'Edit'}
                </Button>
              </Box>
            </Box>
            <Divider />
            <TeacherDetails
              user={user}
              isEditing={isEditingTeacher}
              setUser={setUser}
            />
          </Card>
        </Grid>
      )}
    </Grid>
  );
}

export default EditProfileTab;

import { Grid, Typography, Card, Box, Divider, Button } from '@mui/material';
import { useState } from 'react';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DoneTwoToneIcon from '@mui/icons-material/DoneTwoTone';
import ParentDetails from './ParentDetails';
import TeacherDetails from './TeacherDetails';
import StudentDetails from './StudentDetails';
import UserDetails from './UserDetails';

type UserRole = 'Parent' | 'Teacher' | 'Student';

const userRole: UserRole = 'Parent';

function EditProfileTab() {
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);

  const handleUserEditToggle = () => {
    setIsEditingUser(!isEditingUser);
  };

  const handleRoleEditToggle = () => {
    setIsEditingRole(!isEditingRole);
  };

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
                Personal Details
              </Typography>
              <Typography variant="subtitle2">
                Manage information related to your personal details
              </Typography>
            </Box>
            <Button
              variant="text"
              startIcon={isEditingUser ? <DoneTwoToneIcon /> : <EditTwoToneIcon />}
              onClick={handleUserEditToggle}
            >
              {isEditingUser ? "Save" : "Edit"}
            </Button>
          </Box>
          <Divider />
          <UserDetails isEditing={isEditingUser} />
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
              <Button
                variant="text"
                startIcon={isEditingRole ? <DoneTwoToneIcon /> : <EditTwoToneIcon />}
                onClick={handleRoleEditToggle}
              >
                {isEditingRole ? "Save" : "Edit"}
              </Button>
            </Box>
            <Divider />
            <ParentDetails isEditing={isEditingRole} />
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
              <Typography variant="h4">Teacher Professional Information</Typography>
              <Button
                variant="text"
                startIcon={isEditingRole ? <DoneTwoToneIcon /> : <EditTwoToneIcon />}
                onClick={handleRoleEditToggle}
              >
                {isEditingRole ? "Save" : "Edit"}
              </Button>
            </Box>
            <Divider />
            <TeacherDetails isEditing={isEditingRole} />
          </Card>
        </Grid>
      )}

      {userRole === 'Student' && (
        <Grid item xs={12}>
          <Card>
            <Box p={3}>
              <Typography variant="h4">Student Details</Typography>
            </Box>
            <Divider />
            <StudentDetails />
          </Card>
        </Grid>
      )}
    </Grid>
  );
}

export default EditProfileTab;

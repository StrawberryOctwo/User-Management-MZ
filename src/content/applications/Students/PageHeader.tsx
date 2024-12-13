import { Typography, Button, Grid } from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import RoleBasedComponent from 'src/components/ProtectedComponent';
import { t } from "i18next"

function PageHeader() {
  const navigate = useNavigate(); // Initialize useNavigate

  const user = {
    name: '',
    avatar: '/static/images/avatars/1.jpg'
  };

  // Handle the navigation when button is clicked
  const handleCreateFranchise = () => {
    navigate('create'); // Navigate to the Create Franchise page
  };

  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          {t("students")}
        </Typography>
        <Typography variant="subtitle2">
          {user.name}{t("these_are_your_recent_students")}
        </Typography>
      </Grid>
      <Grid item>
        <RoleBasedComponent allowedRoles={['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin']}>
          <Button
            sx={{ mt: { xs: 2, md: 0 } }}
            variant="contained"
            startIcon={<AddTwoToneIcon fontSize="small" />}
            onClick={handleCreateFranchise} // Add onClick handler
          >
            {t("create_student")}
          </Button>
        </RoleBasedComponent>
      </Grid>
    </Grid>
  );
}

export default PageHeader;

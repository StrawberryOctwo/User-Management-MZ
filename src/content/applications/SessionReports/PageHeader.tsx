import { Typography, Button, Grid } from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { t } from 'i18next';

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
          {t('session_reports')}
        </Typography>
        <Typography variant="subtitle2">
          {user.name}These are your students session reports
        </Typography>
      </Grid>
    </Grid>
  );
}

export default PageHeader;

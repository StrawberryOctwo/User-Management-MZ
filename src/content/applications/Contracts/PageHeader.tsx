import { Typography, Button, Grid } from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { t } from "i18next"

function PageHeader() {
  const navigate = useNavigate(); // Initialize useNavigate

  const user = {
    name: '',
    avatar: '/static/images/avatars/1.jpg'
  };

  // Handle the navigation when button is clicked
  const handleCreateContract = () => {
    navigate('create'); // Navigate to the Create Contract page
  };

  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          {t("contracts")}
        </Typography>
        <Typography variant="subtitle2">
          {user.name}{t("these_are_your_recent_conracts")}
        </Typography>
      </Grid>
      <Grid item>
        <Button
          sx={{ mt: { xs: 2, md: 0 } }}
          variant="contained"
          startIcon={<AddTwoToneIcon fontSize="small" />}
          onClick={handleCreateContract} // Add onClick handler
        >
          {t("create_contract")}
        </Button>
      </Grid>
    </Grid>
  );
}

export default PageHeader;

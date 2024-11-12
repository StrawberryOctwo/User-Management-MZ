import { Typography, Button, Grid } from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

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
          Contracts
        </Typography>
        <Typography variant="subtitle2">
          {user.name}, these are your recent conracts
        </Typography>
      </Grid>
      <Grid item>
        <Button
          sx={{ mt: { xs: 2, md: 0 } }}
          variant="contained"
          startIcon={<AddTwoToneIcon fontSize="small" />}
          onClick={handleCreateContract} // Add onClick handler
        >
          Create conract
        </Button>
      </Grid>
    </Grid>
  );
}

export default PageHeader;

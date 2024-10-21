import { Typography, Button, Grid } from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function PageHeader() {

  const user = {
    name: '',
    avatar: '/static/images/avatars/1.jpg'
  };


  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          Files
        </Typography>
        <Typography variant="subtitle2">
          {user.name}, these are your recent files
        </Typography>
      </Grid>
      <Grid item>
      </Grid>
    </Grid>
  );
}

export default PageHeader;

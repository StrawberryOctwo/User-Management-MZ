import { Box, Typography, Card, Grid, ListItem, List, ListItemText, Divider, Button } from '@mui/material';

function SecurityTab() {
  return (
    <Grid container spacing={3}>
      {/* Password Change Section */}
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
              <Button size="large" variant="outlined">
                Change Password
              </Button>
            </ListItem>
          </List>
        </Card>
      </Grid>
    </Grid>
  );
}

export default SecurityTab;

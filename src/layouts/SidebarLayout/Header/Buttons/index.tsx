import { Box } from '@mui/material';
import HeaderSearch from './Search';
import HeaderNotifications from './Notifications';
import HeaderLocalization from './Localization';
import HeaderAvailability from './Availability';

function HeaderButtons() {
  return (
    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
      <HeaderSearch />
      <Box sx={{ mx: 0.5 }} component="span">
        <HeaderNotifications />
      </Box>
      <Box sx={{ mx: 0.5 }} component="span">
        <HeaderLocalization />
      </Box>
      <Box sx={{ mx: 0.5 }} component="span">
        <HeaderAvailability />
      </Box>
    </Box>
  );
}

export default HeaderButtons;

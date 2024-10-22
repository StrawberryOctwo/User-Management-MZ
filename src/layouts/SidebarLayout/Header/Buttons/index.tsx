import { Box } from '@mui/material';
import HeaderSearch from './Search';
import HeaderNotifications from './Notifications';
import HeaderLocalization from './Localization';

function HeaderButtons() {
  return (
    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
      <HeaderSearch />
      <Box sx={{ mx: 0.5 }} component="span">
        <HeaderNotifications />
      </Box>
      <Box sx={{ mx: 0.5 }} component="span">
        <HeaderLocalization />  {/* Add the localization button here */}
      </Box>
    </Box>
  );
}

export default HeaderButtons;

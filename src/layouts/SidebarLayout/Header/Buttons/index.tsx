import { Box, ListItem } from '@mui/material';
import HeaderSearch from './Search';
import HeaderNotifications from './Notifications';
import HeaderLocalization from './Localization';
import HeaderAvailability from './Availability';
import withRole from 'src/hooks/withRole';
import StudentExamsHeader from './StudentExam';

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
        <ProtectedListItem
          allowedRoles={['Teacher']}
        >
          <HeaderAvailability />
        </ProtectedListItem>
      </Box>
      <Box sx={{ mx: 0.5 }} component="span">
        <ProtectedListItem
          allowedRoles={['Student']}
        ><StudentExamsHeader />
        </ProtectedListItem>
      </Box>
    </Box>
  );
}
const ProtectedListItem = withRole(ListItem);

export default HeaderButtons;

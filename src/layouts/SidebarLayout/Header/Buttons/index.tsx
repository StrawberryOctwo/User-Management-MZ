import { Box } from '@mui/material';
import HeaderSearch from './Search';
import HeaderNotifications from './Notifications';
import HeaderLocalization from './Localization';
import HeaderAvailability from './Availability';
import withRole from 'src/hooks/withRole';
import StudentExamsHeader from './StudentExam';
import ToDoHeader from './ToDo';
import AbsenceNotifications from './Absences';

function HeaderButtons() {
  return (
    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
      <HeaderSearch />
      <HeaderNotifications />
      <HeaderLocalization />
      <ToDoHeader />
      <ProtectedBox allowedRoles={['Teacher']}>
        <HeaderAvailability />
      </ProtectedBox>
      <ProtectedBox allowedRoles={['Student']}>
        <StudentExamsHeader />
      </ProtectedBox>
      <ProtectedBox allowedRoles={['Student']}>
        <AbsenceNotifications />
      </ProtectedBox>
    </Box>
  );
}

const ProtectedBox = withRole(Box);

export default HeaderButtons;

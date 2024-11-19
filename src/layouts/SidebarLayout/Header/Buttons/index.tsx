import { Box } from '@mui/material';
import HeaderSearch from './Search';
import HeaderNotifications from './Notifications';
import HeaderLocalization from './Localization';
import HeaderAvailability from './Availability';
import StudentExamsHeader from './StudentExam';
import ToDoHeader from './ToDo';
import AbsenceNotifications from './Absences';
import SurveyBuilder from './SurveyBuilder/SurveyBuilder';
import SurveyNotifications from './Survey';
import ViewSurveysTable from './SurveyBuilder/ViewSurveysTable';
import HeaderToDoList from './AssignedToDos/ToDoListPopUp';
import withRole from 'src/hooks/withRole';
import RemoteAlert from 'src/components/RemoteAlert';

function HeaderButtons() {
  return (
    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* <HeaderSearch /> */}
      <RemoteAlert />
      <HeaderNotifications />

      {/* <HeaderLocalization /> */}
      <SurveyNotifications />
      <ProtectedBox allowedRoles={[ 'FranchiseAdmin', 'LocationAdmin', 'Teacher', 'Student']}>
        <HeaderToDoList />
      </ProtectedBox>
      <ProtectedBox allowedRoles={['SuperAdmin']}>
        <ViewSurveysTable />
      </ProtectedBox>
      <ProtectedBox allowedRoles={['SuperAdmin']}>
        <SurveyBuilder />
      </ProtectedBox>
      <ProtectedBox allowedRoles={['SuperAdmin','FranchiseAdmin','LocationAdmin','Teacher']}>
        <ToDoHeader />
      </ProtectedBox>
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

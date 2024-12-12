import { useContext } from 'react';

import {
  ListSubheader,
  alpha,
  Box,
  List,
  styled,
  Button,
  ListItem
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InsertChartIcon from '@mui/icons-material/InsertChart';

import { NavLink as RouterLink } from 'react-router-dom';
import { SidebarContext } from 'src/contexts/SidebarContext';
import EditCalendarIcon from '@mui/icons-material/CalendarMonth';
import {
  AttachMoney,
  BarChart,
  BusinessOutlined,
  ChatBubble,
  FileUploadSharp,
  Interests,
  LocationSearching,
  LocationSearchingTwoTone,
  MoneyRounded,
  Person,
  PersonAddAlt1Sharp,
  Topic
} from '@mui/icons-material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ReceiptIcon from '@mui/icons-material/Receipt';
import withRole from 'src/hooks/withRole';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { useTranslation } from 'react-i18next';


const MenuWrapper = styled(Box)(
  ({ theme }) => `
  .MuiList-root {
    padding: ${theme.spacing(1)};

    & > .MuiList-root {
      padding: 0 ${theme.spacing(0)} ${theme.spacing(1)};
    }
  }

    .MuiListSubheader-root {
      text-transform: uppercase;
      font-weight: bold;
      font-size: ${theme.typography.pxToRem(12)};
      color: ${theme.colors.alpha.trueWhite[50]};
      padding: ${theme.spacing(0, 2.5)};
      line-height: 1.4;
    }
`
);

const SubMenuWrapper = styled(Box)(
  ({ theme }) => `
    .MuiList-root {

      .MuiListItem-root {
        padding: 1px 0;

        .MuiBadge-root {
          position: absolute;
          right: ${theme.spacing(3.2)};

          .MuiBadge-standard {
            background: ${theme.colors.primary.main};
            font-size: ${theme.typography.pxToRem(10)};
            font-weight: bold;
            text-transform: uppercase;
            color: ${theme.palette.primary.contrastText};
          }
        }
    
        .MuiButton-root {
          display: flex;
          color: ${theme.colors.alpha.trueWhite[70]};
          background-color: transparent;
          width: 100%;
          justify-content: flex-start;
          padding: ${theme.spacing(1.2, 3)};

          .MuiButton-startIcon,
          .MuiButton-endIcon {
            transition: ${theme.transitions.create(['color'])};

            .MuiSvgIcon-root {
              font-size: inherit;
              transition: none;
            }
          }

          .MuiButton-startIcon {
            color: ${theme.colors.alpha.trueWhite[30]};
            font-size: ${theme.typography.pxToRem(20)};
            margin-right: ${theme.spacing(1)};
          }
          
          .MuiButton-endIcon {
            color: ${theme.colors.alpha.trueWhite[50]};
            margin-left: auto;
            opacity: .8;
            font-size: ${theme.typography.pxToRem(20)};
          }

          &.active,
          &:hover {
            background-color: ${alpha(theme.colors.alpha.trueWhite[100], 0.06)};
            color: ${theme.colors.alpha.trueWhite[100]};

            .MuiButton-startIcon,
            .MuiButton-endIcon {
              color: ${theme.colors.alpha.trueWhite[100]};
            }
          }
        }

        &.Mui-children {
          flex-direction: column;

          .MuiBadge-root {
            position: absolute;
            right: ${theme.spacing(7)};
          }
        }

        .MuiCollapse-root {
          width: 100%;

          .MuiList-root {
            padding: ${theme.spacing(1, 0)};
          }

          .MuiListItem-root {
            padding: 1px 0;

            .MuiButton-root {
              padding: ${theme.spacing(0.8, 3)};

              .MuiBadge-root {
                right: ${theme.spacing(3.2)};
              }

              &:before {
                content: ' ';
                background: ${theme.colors.alpha.trueWhite[100]};
                opacity: 0;
                transition: ${theme.transitions.create([
    'transform',
    'opacity'
  ])};
                width: 6px;
                height: 6px;
                transform: scale(0);
                transform-origin: center;
                border-radius: 20px;
                margin-right: ${theme.spacing(1.8)};
              }

              &.active,
              &:hover {

                &:before {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            }
          }
        }
      }
    }
`
);

function SidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);
  const { t } = useTranslation(); 
  return (
    <MenuWrapper>
      {/* Dashboards Section */}
      <List
        component="div"
        subheader={
          <ListSubheader component="div" disableSticky>
            {t("dashboards")}
          </ListSubheader>
        }
      >
        <SubMenuWrapper>
          <List component="div">
            <ProtectedListItem
              allowedRoles={[
                'SuperAdmin',
                'FranchiseAdmin',
                'Teacher',
                'Student',
                'Parent',
                'LocationAdmin'
              ]}
            >
              <ListItem component="div">
                <Button
                  disableRipple
                  component={RouterLink}
                  onClick={closeSidebar}
                  to="/dashboard/calendar"
                  startIcon={<EditCalendarIcon />}
                >
                  {t("calendar")}
                </Button>
              </ListItem>
            </ProtectedListItem>
            <ProtectedListItem
              allowedRoles={['SuperAdmin', 'FranchiseAdmin']}
            >
              <ListItem component="div">
                <Button
                  disableRipple
                  component={RouterLink}
                  onClick={closeSidebar}
                  to="/dashboard/charts"
                  startIcon={<InsertChartIcon />}
                >
                  {t("dashboards")}
                </Button>
              </ListItem>
            </ProtectedListItem>
            <ProtectedListItem allowedRoles={['SuperAdmin']}>
              <ListItem component="div">
                <Button
                  disableRipple
                  component={RouterLink}
                  onClick={closeSidebar}
                  to="/dashboard/interests"
                  startIcon={<Interests />}
                >
                  {t("interests")}
                </Button>
              </ListItem>
            </ProtectedListItem>
          </List>
        </SubMenuWrapper>
      </List>

      {/* Management Section */}
      <SubMenuWrapper>
        {/* User Management Subsection */}
        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              {t("user_management")}
            </ListSubheader>
          }
        >
          <ProtectedListItem
            allowedRoles={[
              'SuperAdmin',
              'FranchiseAdmin',
              'LocationAdmin',
              'Teacher',
              'Parent',
              'Student'
            ]}
          >
            {/* Intentionally left empty as in your final code */}
          </ProtectedListItem>
          <ProtectedListItem allowedRoles={['SuperAdmin', 'FranchiseAdmin']}>
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/management/franchises"
                startIcon={<BusinessOutlined />}
              >
                {t("franchises")}
              </Button>
            </ListItem>
          </ProtectedListItem>

          <ProtectedListItem
            allowedRoles={['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin']}
          >
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/management/locations"
                startIcon={<LocationOnIcon />}
              >
                {t("locations")}
              </Button>
            </ListItem>
          </ProtectedListItem>
          <ProtectedListItem allowedRoles={['SuperAdmin']}>
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/management/franchise-admins"
                startIcon={<LocationSearchingTwoTone />}
              >
                {t("franchise_admins")}
              </Button>
            </ListItem>
          </ProtectedListItem>
          <ProtectedListItem allowedRoles={['SuperAdmin', 'FranchiseAdmin']}>
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/management/location-admins"
                startIcon={<LocationSearching />}
              >
                {t("location_admins")}
              </Button>
            </ListItem>
          </ProtectedListItem>
          <ProtectedListItem
            allowedRoles={['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin']}
          >
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/management/teachers"
                startIcon={<Person />}
              >
                {t("teachers")}
              </Button>
            </ListItem>
          </ProtectedListItem>
          <ProtectedListItem
            allowedRoles={['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin']}
          >
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/management/parents"
                startIcon={<PersonAddAlt1Sharp />}
              >
                {t("parents")}
              </Button>
            </ListItem>
          </ProtectedListItem>
          <ProtectedListItem
            allowedRoles={[
              'SuperAdmin',
              'FranchiseAdmin',
              'LocationAdmin',
              'Teacher',
              'Parent'
            ]}
          >
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/management/students"
                startIcon={<PersonAddAlt1Sharp />}
              >
                {t("students")}
              </Button>
            </ListItem>
          </ProtectedListItem>
        </List>

        {/* NEW Chat Subsection */}
        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              {t("chat")}
            </ListSubheader>
          }
        >
          <ProtectedListItem
            allowedRoles={[
              'SuperAdmin',
              'FranchiseAdmin',
              'LocationAdmin',
              'Teacher',
              'Parent',
              'Student'
            ]}
          >
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/management/chat"
                startIcon={<ChatBubble />}
              >
                {t("chat_room")}
              </Button>
            </ListItem>
          </ProtectedListItem>
        </List>

        {/* Content Management Subsection */}
        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              {t("content_management")}
            </ListSubheader>
          }
        >
          <ProtectedListItem allowedRoles={['SuperAdmin', 'FranchiseAdmin','Parent', 'Student','Teacher']}>
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/management/files"
                startIcon={<FileUploadSharp />}
              >
                {t("files")}
              </Button>
            </ListItem>
          </ProtectedListItem>
          <ProtectedListItem allowedRoles={['SuperAdmin', 'FranchiseAdmin']}>
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/management/topics"
                startIcon={<Topic />}
              >
                {t("topics")}
              </Button>
            </ListItem>
          </ProtectedListItem>
          <ProtectedListItem allowedRoles={['SuperAdmin', 'FranchiseAdmin']}>
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/management/contracts"
                startIcon={<Topic />}
              >
                {t("contracts")}
              </Button>
            </ListItem>
          </ProtectedListItem>
        </List>

        {/* Reports Subsection */}
        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              {t("reports")}
            </ListSubheader>
          }
        >
          <ProtectedListItem allowedRoles={['Parent', 'Student']}>
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/management/session-reports"
                startIcon={<DescriptionOutlinedIcon />}
              >
                {t("session_reports")}
              </Button>
            </ListItem>
          </ProtectedListItem>
          <ProtectedListItem allowedRoles={['']}>
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/management/payments"
                startIcon={<AttachMoney />}
              >
                {t("session_payments")}
              </Button>
            </ListItem>
          </ProtectedListItem>
        </List>

        {/* Finance Subsection */}
        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              {t("finance")}
            </ListSubheader>
          }
        >
          <ProtectedListItem allowedRoles={['FranchiseAdmin', 'Teacher', 'Parent']}>
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/management/invoices"
                startIcon={<ReceiptIcon />}
              >
                {t("monthly_invoices")}
              </Button>
            </ListItem>
          </ProtectedListItem>
          <ProtectedListItem allowedRoles={['SuperAdmin', 'FranchiseAdmin']}>
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/management/billings"
                startIcon={<MoneyRounded />}
              >
                {t("franchise_bills")}
              </Button>
            </ListItem>
          </ProtectedListItem>
        </List>

        {/* HR Subsection */}
        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              {t("HR")}
            </ListSubheader>
          }
        >
          <ProtectedListItem allowedRoles={['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin']}>
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/management/daysoff"
                startIcon={<EventBusyIcon />}
              >
                {t("days_off")}
              </Button>
            </ListItem>
          </ProtectedListItem>
        </List>
      </SubMenuWrapper>
    </MenuWrapper>
  );
}

const ProtectedListItem = withRole(ListItem);

export default SidebarMenu;

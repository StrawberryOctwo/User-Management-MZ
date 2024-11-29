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

import { NavLink as RouterLink } from 'react-router-dom';
import { SidebarContext } from 'src/contexts/SidebarContext';
import EditCalendarIcon from '@mui/icons-material/CalendarMonth';
import {
  AttachMoney,
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

  return (
    <>
      <MenuWrapper>
        <List component="div">
          <SubMenuWrapper></SubMenuWrapper>
        </List>
        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              Dashboards
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
                    Calendar
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
                    Interests
                  </Button>
                </ListItem>
              </ProtectedListItem>
            </List>
          </SubMenuWrapper>
        </List>
        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              Management
            </ListSubheader>
          }
        >
          <SubMenuWrapper>
            <List component="div">
              <ProtectedListItem
                allowedRoles={[
                  'SuperAdmin',
                  'FranchiseAdmin',
                  'LocationAdmin',
                  'Teacher'
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
                    Chat Room
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
                    to="/management/franchises"
                    startIcon={<BusinessOutlined />}
                  >
                    Franchises
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
                    to="/management/billings"
                    startIcon={<MoneyRounded />}
                  >
                    Billings
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
                    Locations
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
                    Franchise Admins
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
                    to="/management/location-admins"
                    startIcon={<LocationSearching />}
                  >
                    Location Admins
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
                    Teachers
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
                    Parents
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
                    Students
                  </Button>
                </ListItem>
              </ProtectedListItem>

              <ProtectedListItem
                allowedRoles={[
                  'SuperAdmin',
                  'FranchiseAdmin',
                  'Parent',
                  'Student',
                  'LocationAdmin',
                  'Teacher'
                ]}
              >
                <ListItem component="div">
                  <Button
                    disableRipple
                    component={RouterLink}
                    onClick={closeSidebar}
                    to="/management/files"
                    startIcon={<FileUploadSharp />}
                  >
                    Files
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
                    to="/management/topics"
                    startIcon={<Topic />}
                  >
                    Topics
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
                    to="/management/contracts"
                    startIcon={<Topic />}
                  >
                    Contracts
                  </Button>
                </ListItem>
              </ProtectedListItem>
              <ProtectedListItem allowedRoles={['Parent', 'Student']}>
                <ListItem component="div">
                  <Button
                    disableRipple
                    component={RouterLink}
                    onClick={closeSidebar}
                    to="/management/session-reports"
                    startIcon={<DescriptionOutlinedIcon />}
                  >
                    Session Reports
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
                    Session Payments
                  </Button>
                </ListItem>
              </ProtectedListItem>
              <ProtectedListItem
                allowedRoles={['FranchiseAdmin', 'Teacher', 'Parent']}
              >
                <ListItem component="div">
                  <Button
                    disableRipple
                    component={RouterLink}
                    onClick={closeSidebar}
                    to="/management/invoices"
                    startIcon={<ReceiptIcon />}
                  >
                    Monthly Invoices
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
                    to="/management/daysoff"
                    startIcon={<EventBusyIcon />}
                  >
                    Days Off
                  </Button>
                </ListItem>
              </ProtectedListItem>
            </List>
          </SubMenuWrapper>
        </List>
      </MenuWrapper>
    </>
  );
}

const ProtectedListItem = withRole(ListItem);

export default SidebarMenu;

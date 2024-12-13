import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router';

import SidebarLayout from 'src/layouts/SidebarLayout';
import BaseLayout from 'src/layouts/BaseLayout';

import SuspenseLoader from 'src/components/SuspenseLoader';
import ProtectedRoute from './protectedRoute';
import Login from './content/pages/Login/Login';
import Logout from './components/Logout';
import ApplicationsMessenger from 'src/content/applications/Messenger';
import DashboardCrypto from 'src/content/dashboard';

const Loader = (Component) => (props) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  FRANCHISE_ADMIN: 'FranchiseAdmin',
  LOCATION_ADMIN: 'LocationAdmin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent'
} as const;

// Pages

const Overview = Loader(lazy(() => import('src/content/overview')));

// Dashboards

const Crypto = Loader(lazy(() => import('src/content/dashboard')));
const Calendar = Loader(
  lazy(() => import('src/components/Calendar/CalendarContent'))
);

// Applications

const Messenger = Loader(
  lazy(() => import('src/content/applications/Messenger'))
);
const Transactions = Loader(
  lazy(() => import('src/content/applications/Transactions'))
);

const Files = Loader(lazy(() => import('src/content/applications/Files')));
const CreateFile = Loader(
  lazy(() => import('src/content/applications/Files/Create'))
);

const FranchiseAdmins = Loader(
  lazy(() => import('src/content/applications/FranchiseAdmins'))
);

const FranchiseAdminsCreate = Loader(
  lazy(() => import('src/content/applications/FranchiseAdmins/Create'))
);

const FranchiseAdminsView = Loader(
  lazy(() => import('src/content/applications/FranchiseAdmins/View'))
);
const FranchiseAdminsEdit = Loader(
  lazy(() => import('src/content/applications/FranchiseAdmins/Edit'))
);

const Interest = Loader(
  lazy(() => import('src/content/applications/Interest'))
);
const ViewInterest = Loader(
  lazy(() => import('src/content/applications/Interest/View'))
);

const Location = Loader(
  lazy(() => import('src/content/applications/Locations'))
);

const LocationCreate = Loader(
  lazy(() => import('src/content/applications/Locations/Create'))
);

const LocationView = Loader(
  lazy(() => import('src/content/applications/Locations/View'))
);
const LocationEdit = Loader(
  lazy(() => import('src/content/applications/Locations/Edit'))
);

const Parent = Loader(lazy(() => import('src/content/applications/Parents')));

const ParentCreate = Loader(
  lazy(() => import('src/content/applications/Parents/Create'))
);

const ParentView = Loader(
  lazy(() => import('src/content/applications/Parents/View'))
);
const ParentEdit = Loader(
  lazy(() => import('src/content/applications/Parents/Edit'))
);

const LocationAdmins = Loader(
  lazy(() => import('src/content/applications/LocationAdmins'))
);
const LocationAdminsCreate = Loader(
  lazy(() => import('src/content/applications/LocationAdmins/Create'))
);
const LocationAdminsEdit = Loader(
  lazy(() => import('src/content/applications/LocationAdmins/Edit'))
);

const LocationAdminsView = Loader(
  lazy(() => import('src/content/applications/LocationAdmins/View'))
);

const Teachers = Loader(
  lazy(() => import('src/content/applications/Teachers'))
);
const TeachersCreate = Loader(
  lazy(() => import('src/content/applications/Teachers/Create'))
);
const TeachersView = Loader(
  lazy(() => import('src/content/applications/Teachers/View'))
);
const TeachersEdit = Loader(
  lazy(() => import('src/content/applications/Teachers/Edit'))
);

const Students = Loader(
  lazy(() => import('src/content/applications/Students'))
);
const StudentsCreate = Loader(
  lazy(() => import('src/content/applications/Students/Create'))
);
const StudentsView = Loader(
  lazy(() => import('src/content/applications/Students/View'))
);
const StudentsEdit = Loader(
  lazy(() => import('src/content/applications/Students/Edit'))
);

const Franchises = Loader(
  lazy(() => import('src/content/applications/Franchises'))
);
const FranchiseCreate = Loader(
  lazy(() => import('src/content/applications/Franchises/Create'))
);
const FranchiseEdit = Loader(
  lazy(() => import('src/content/applications/Franchises/Edit'))
);

const FranchiseView = Loader(
  lazy(() => import('src/content/applications/Franchises/View'))
);

const Topics = Loader(lazy(() => import('src/content/applications/Topics')));

const TopicCreate = Loader(
  lazy(() => import('src/content/applications/Topics/Create'))
);

const Contracts = Loader(
  lazy(() => import('src/content/applications/Contracts'))
);
const CreateContract = Loader(
  lazy(() => import('src/content/applications/Contracts/Create'))
);
const EditContract = Loader(
  lazy(() => import('src/content/applications/Contracts/Edit'))
);

const DaysOff = Loader(lazy(() => import('src/content/applications/DaysOff')));

const DaysOffEditHoliday = Loader(
  lazy(() => import('src/content/applications/DaysOff/EditHoliday'))
);

const DaysOffEditClosingDay = Loader(
  lazy(() => import('src/content/applications/DaysOff/EditClosingDay'))
);

const UserProfile = Loader(
  lazy(() => import('src/content/applications/Users/profile'))
);
const UserSettings = Loader(
  lazy(() => import('src/content/applications/Users/settings'))
);

const Billings = Loader(
  lazy(() => import('src/content/applications/Billings'))
);
const Payments = Loader(
  lazy(() => import('src/content/applications/Payments'))
);


const ManageToDo = Loader(
  lazy(() => import('src/layouts/SidebarLayout/Header/Buttons/ToDo'))
);

const Invoices = Loader(
  lazy(() => import('src/content/applications/Invoices'))
);
const SessionReports = Loader(
  lazy(() => import('src/content/applications/SessionReports'))
);
const CreateBill = Loader(
  lazy(() => import('src/content/applications/Billings/Create'))
);

// Components

const Buttons = Loader(
  lazy(() => import('src/content/pages/Components/Buttons'))
);
const Modals = Loader(
  lazy(() => import('src/content/pages/Components/Modals'))
);
const Accordions = Loader(
  lazy(() => import('src/content/pages/Components/Accordions'))
);
const Tabs = Loader(lazy(() => import('src/content/pages/Components/Tabs')));
const Badges = Loader(
  lazy(() => import('src/content/pages/Components/Badges'))
);
const Tooltips = Loader(
  lazy(() => import('src/content/pages/Components/Tooltips'))
);
const Avatars = Loader(
  lazy(() => import('src/content/pages/Components/Avatars'))
);
const Cards = Loader(lazy(() => import('src/content/pages/Components/Cards')));
const Forms = Loader(lazy(() => import('src/content/pages/Components/Forms')));

// Status

const Status404 = Loader(
  lazy(() => import('src/content/pages/Status/Status404'))
);
const Status500 = Loader(
  lazy(() => import('src/content/pages/Status/Status500'))
);
const StatusComingSoon = Loader(
  lazy(() => import('src/content/pages/Status/ComingSoon'))
);
const StatusMaintenance = Loader(
  lazy(() => import('src/content/pages/Status/Maintenance'))
);

const routes: RouteObject[] = [
  {
    path: '',
    element: <BaseLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="login" replace />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'status',
        children: [
          {
            path: '',
            element: <Navigate to="404" replace />
          },
          {
            path: '404',
            element: <Status404 />
          },
          {
            path: '500',
            element: <Status500 />
          },
          {
            path: 'maintenance',
            element: <StatusMaintenance />
          },
          {
            path: 'coming-soon',
            element: <StatusComingSoon />
          }
        ]
      },
      {
        path: '*',
        element: <Status404 />
      }
    ]
  },
  {
    path: '',
    element: <ProtectedRoute />, // Protected routes wrapper
    children: [
      {
        path: 'logout',
        element: <Logout />
      },
      {
        path: 'dashboard',
        element: <SidebarLayout />,
        children: [
          {
            path: '',
            element: <Navigate to="calendar" replace />
          },
          {
            path: 'charts',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <DashboardCrypto />
              </ProtectedRoute>
            )
          },
          {
            path: 'interests',
            element: <Interest />
          },
          {
            path: 'interests/view/:id',
            element: <ViewInterest />
          },
          {
            path: 'calendar',
            element: <Calendar />
          },
          {
            path: 'crypto',
            element: <Crypto />
          },
          {
            path: 'messenger',
            element: <Messenger />
          }
        ]
      },
      {
        path: 'management',
        element: <SidebarLayout />,
        children: [
          {
            path: '',
            element: <Navigate to="transactions" replace />
          },
          {
            path: 'chat',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN,
                  ROLES.TEACHER,
                  ROLES.STUDENT,
                  ROLES.PARENT
                ]}
              >
                <ApplicationsMessenger />
              </ProtectedRoute>
            )
          },
          {
            path: 'manage/todos',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN,ROLES.LOCATION_ADMIN,ROLES.TEACHER]}
              >
                <ManageToDo />
              </ProtectedRoute>
            )
          },
          {
            path: 'franchises',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <Franchises />
              </ProtectedRoute>
            )
          },
          {
            path: 'franchises/create',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <FranchiseCreate />
              </ProtectedRoute>
            )
          },
          {
            path: 'franchises/edit/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <FranchiseEdit />
              </ProtectedRoute>
            )
          },
          {
            path: 'franchises/view/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <FranchiseView />
              </ProtectedRoute>
            )
          },

          {
            path: 'billings',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <Billings />
              </ProtectedRoute>
            )
          },

          {
            path: 'billings/create',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <CreateBill />
              </ProtectedRoute>
            )
          },

          {
            path: 'session-reports',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN,
                  ROLES.TEACHER,
                  ROLES.PARENT,
                  ROLES.STUDENT
                ]}
              >
                <SessionReports />
              </ProtectedRoute>
            )
          },

          {
            path: 'payments',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN,
                  ROLES.TEACHER,
                  ROLES.PARENT
                ]}
              >
                <Payments />
              </ProtectedRoute>
            )
          },
          {
            path: 'invoices',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN,
                  ROLES.TEACHER,
                  ROLES.PARENT
                ]}
              >
                <Invoices />
              </ProtectedRoute>
            )
          },

          {
            path: 'files/',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN,
                  ROLES.TEACHER,
                  ROLES.PARENT,
                  ROLES.STUDENT
                ]}
              >
                <Files />
              </ProtectedRoute>
            )
          },
          {
            path: 'files/create',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN,
                  ROLES.TEACHER,
                  ROLES.PARENT,
                  ROLES.STUDENT
                ]}
              >
                <CreateFile />
              </ProtectedRoute>
            )
          },

          {
            path: 'franchise-admins/',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <FranchiseAdmins />
              </ProtectedRoute>
            )
          },
          {
            path: 'franchise-admins/create',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <FranchiseAdminsCreate />
              </ProtectedRoute>
            )
          },
          {
            path: 'franchise-admins/view/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <FranchiseAdminsView />
              </ProtectedRoute>
            )
          },
          {
            path: 'franchise-admins/edit/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <FranchiseAdminsEdit />
              </ProtectedRoute>
            )
          },

          {
            path: 'locations/',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN
                ]}
              >
                <Location />
              </ProtectedRoute>
            )
          },
          {
            path: 'locations/create',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <LocationCreate />
              </ProtectedRoute>
            )
          },
          {
            path: 'locations/view/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN
                ]}
              >
                <LocationView />
              </ProtectedRoute>
            )
          },
          {
            path: 'locations/edit/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <LocationEdit />
              </ProtectedRoute>
            )
          },

          {
            path: 'location-admins/',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <LocationAdmins />
              </ProtectedRoute>
            )
          },
          {
            path: 'location-admins/create',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <LocationAdminsCreate />
              </ProtectedRoute>
            )
          },
          {
            path: 'location-admins/view/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <LocationAdminsView />
              </ProtectedRoute>
            )
          },
          {
            path: 'location-admins/edit/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <LocationAdminsEdit />
              </ProtectedRoute>
            )
          },
          {
            path: 'teachers/',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN
                ]}
              >
                <Teachers />
              </ProtectedRoute>
            )
          },
          {
            path: 'teachers/create',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN
                ]}
              >
                <TeachersCreate />
              </ProtectedRoute>
            )
          },
          {
            path: 'teachers/view/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN
                ]}
              >
                <TeachersView />
              </ProtectedRoute>
            )
          },
          {
            path: 'teachers/edit/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN
                ]}
              >
                <TeachersEdit />
              </ProtectedRoute>
            )
          },
          {
            path: 'parents/',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN
                ]}
              >
                <Parent />
              </ProtectedRoute>
            )
          },
          {
            path: 'parents/create',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN
                ]}
              >
                <ParentCreate />
              </ProtectedRoute>
            )
          },
          {
            path: 'parents/view/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN
                ]}
              >
                <ParentView />
              </ProtectedRoute>
            )
          },
          {
            path: 'parents/edit/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN
                ]}
              >
                <ParentEdit />
              </ProtectedRoute>
            )
          },
          {
            path: 'students/',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN,
                  ROLES.TEACHER,
                  ROLES.PARENT
                ]}
              >
                <Students />
              </ProtectedRoute>
            )
          },
          {
            path: 'students/create',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN,
                  ROLES.TEACHER
                ]}
              >
                <StudentsCreate />
              </ProtectedRoute>
            )
          },

          {
            path: 'students/view/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN,
                  ROLES.TEACHER,
                  ROLES.PARENT
                ]}
              >
                <StudentsView />
              </ProtectedRoute>
            )
          },
          {
            path: 'students/edit/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN,
                  ROLES.TEACHER
                ]}
              >
                <StudentsEdit />
              </ProtectedRoute>
            )
          },
          {
            path: 'topics',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <Topics />
              </ProtectedRoute>
            )
          },
          {
            path: 'topics/create',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <TopicCreate />
              </ProtectedRoute>
            )
          },
          {
            path: 'contracts',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <Contracts />
              </ProtectedRoute>
            )
          },
          {
            path: 'contracts/create',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <CreateContract />
              </ProtectedRoute>
            )
          },
          {
            path: 'contracts/edit/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
              >
                <EditContract />
              </ProtectedRoute>
            )
          },
          {
            path: 'daysoff',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN
                ]}
              >
                <DaysOff />
              </ProtectedRoute>
            )
          },
          {
            path: 'daysoff/holiday/edit/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN
                ]}
              >
                <DaysOffEditHoliday />
              </ProtectedRoute>
            )
          },
          {
            path: 'daysoff/closingDay/edit/:id',
            element: (
              <ProtectedRoute
                requiredRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.FRANCHISE_ADMIN,
                  ROLES.LOCATION_ADMIN
                ]}
              >
                <DaysOffEditClosingDay />
              </ProtectedRoute>
            )
          },
          {
            path: 'profile',
            children: [
              {
                path: '',
                element: (
                  <ProtectedRoute
                    requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
                  >
                    <Navigate to="details" replace />
                  </ProtectedRoute>
                )
              },
              {
                path: 'details',
                element: (
                  <ProtectedRoute
                    requiredRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_ADMIN]}
                  >
                    <UserProfile />
                  </ProtectedRoute>
                )
              },
              {
                path: 'settings',
                element: (
                  <ProtectedRoute
                    requiredRoles={[
                      ROLES.SUPER_ADMIN,
                      ROLES.FRANCHISE_ADMIN,
                      ROLES.LOCATION_ADMIN,
                      ROLES.TEACHER,
                      ROLES.PARENT,
                      ROLES.STUDENT
                    ]}
                  >
                    <UserSettings />
                  </ProtectedRoute>
                )
              }
            ]
          }
        ]
      },
      {
        path: '/components',
        element: <SidebarLayout />,
        children: [
          {
            path: '',
            element: <Navigate to="buttons" replace />
          },
          {
            path: 'buttons',
            element: <Buttons />
          },
          {
            path: 'modals',
            element: <Modals />
          },
          {
            path: 'accordions',
            element: <Accordions />
          },
          {
            path: 'tabs',
            element: <Tabs />
          },
          {
            path: 'badges',
            element: <Badges />
          },
          {
            path: 'tooltips',
            element: <Tooltips />
          },
          {
            path: 'avatars',
            element: <Avatars />
          },
          {
            path: 'cards',
            element: <Cards />
          },
          {
            path: 'forms',
            element: <Forms />
          }
        ]
      }
    ]
  }
];

export default routes;

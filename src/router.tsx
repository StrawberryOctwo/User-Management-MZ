import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router';

import SidebarLayout from 'src/layouts/SidebarLayout';
import BaseLayout from 'src/layouts/BaseLayout';

import SuspenseLoader from 'src/components/SuspenseLoader';
import ProtectedRoute from './protectedRoute';
import Login from './content/pages/Login/Login';
import Logout from './components/Logout';

const Loader = (Component) => (props) =>
(
  <Suspense fallback={<SuspenseLoader />}>
    <Component {...props} />
  </Suspense>
);

// Pages

const Overview = Loader(lazy(() => import('src/content/overview')));

// Dashboards

const Crypto = Loader(lazy(() => import('src/content/dashboards/Crypto')));
const Calendar = Loader(lazy(() => import('src/components/Calendar/CalendarContent')));


// Applications

const Messenger = Loader(
  lazy(() => import('src/content/applications/Messenger'))
);
const Transactions = Loader(
  lazy(() => import('src/content/applications/Transactions'))

);


const Files = Loader(
  lazy(() => import('src/content/applications/Files'))
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
const UserProfile = Loader(
  lazy(() => import('src/content/applications/Users/profile'))
);
const UserSettings = Loader(
  lazy(() => import('src/content/applications/Users/settings'))
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
        element: <Overview /> // This remains unprotected
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
      {  path: 'logout',
      element: <Logout />,},
      {
     
        path: 'dashboard',
        element: <SidebarLayout />,
        children: [
          {
            path: '',
            element: <Navigate to="calendar" replace />
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
            path: 'franchises',
            element: <Franchises />
          },
          {
            path: 'franchises/create',
            element: <FranchiseCreate />
          },
          {
            path: 'franchises/edit/:id',
            element: <FranchiseEdit />
          },
          {
            path: 'franchises/view/:id',
            element: <FranchiseView/>
          },

          {
            path: 'files/',
            element: <Files/>
          },

          {
            path: 'franchise-admins/',
            element: <FranchiseAdmins/>
          },
          {
            path: 'franchise-admins/create',
            element: <FranchiseAdminsCreate/>
            },
          {
          path: 'franchise-admins/view/:id',
          element: <FranchiseAdminsView/>
          },
          {
            path: 'franchise-admins/edit/:id',
            element: <FranchiseAdminsEdit/>
            },

          {
            path: 'locations/',
            element: <Location/>
          },
          {
            path: 'locations/create',
            element: <LocationCreate/>
          },
          {
            path: 'locations/view/:id',
            element: <LocationView/>
          },
          {
            path: 'locations/edit/:id',
            element: <LocationEdit/>
          },

          {
            path: 'location-admins/',
            element: <LocationAdmins/>
          },
          {
            path: 'location-admins/create',
            element: <LocationAdminsCreate/>
          },
          {
            path: 'location-admins/view/:id',
            element: <LocationAdminsView/>
          },
          {
            path: 'location-admins/edit/:id',
            element: <LocationAdminsEdit/>
          },
          {
            path: 'teachers/',
            element: <Teachers/>
          },
          {
            path: 'teachers/create',
            element: <TeachersCreate/>
          },
          {
            path: 'teachers/view/:id',
            element: <TeachersView/>
          },
          {
            path: 'teachers/edit/:id',
            element: <TeachersEdit/>
          },

          {
            path: 'students/',
            element: <Students/>
          },
          {
            path: 'students/create',
            element: <StudentsCreate/>
          },

          {
            path: 'students/view/:id',
            element: <StudentsView/>
          },
          {
            path: 'students/edit/:id',
            element: <StudentsEdit/>
          },
          {
            path: 'profile',
            children: [
              {
                path: '',
                element: <Navigate to="details" replace />
              },
              {
                path: 'details',
                element: <UserProfile />
              },
              {
                path: 'settings',
                element: <UserSettings />
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


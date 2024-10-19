import React from 'react';
import { useAuth } from './useAuth';

interface WithRoleProps {
  allowedRoles: string[];
}

const withRole = <P extends object>(Component: React.ComponentType<P>) => {
  return ({ allowedRoles, ...props }: WithRoleProps & P) => {
    const { userRoles } = useAuth();

    if (!userRoles || !allowedRoles.some(role => userRoles.includes(role))) {
      // If none of the userRoles match the allowedRoles, don't render the component
      return null;
    }

    return <Component {...(props as P)} />;
  };
};

export default withRole;

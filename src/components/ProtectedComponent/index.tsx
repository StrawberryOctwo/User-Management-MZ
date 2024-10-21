import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface RoleBasedComponentProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({ allowedRoles, children }) => {
    const { userRoles } = useAuth();

    const hasAccess = userRoles?.some(role => allowedRoles.includes(role));

    if (!hasAccess) {
        return null;
    }

    return <>{children}</>;
};

export default RoleBasedComponent;

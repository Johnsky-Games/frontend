import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import AccessDenied from './AccessDenied';

interface PermissionGateProps {
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    requireSuperAdmin?: boolean;
    requireAnyAdmin?: boolean;
    fallback?: React.ReactNode;
    children: React.ReactNode;
    showAccessDenied?: boolean; // New prop to explicitly show AccessDenied component
}

/**
 * Component to conditionally render children based on user permissions
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
    permission,
    permissions,
    requireAll = false,
    requireSuperAdmin = false,
    requireAnyAdmin = false,
    fallback,
    children,
    showAccessDenied = false
}) => {
    const {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isMainAdmin
    } = usePermissions();

    // Determine the default fallback
    const defaultFallback = showAccessDenied ? (
        <AccessDenied
            requiredPermission={permission || (permissions ? permissions.join(', ') : undefined)}
        />
    ) : fallback || null;

    // Check super admin requirement (main admin = not collaborator)
    if (requireSuperAdmin && !isMainAdmin()) {
        return <>{defaultFallback}</>;
    }

    // Check any admin role requirement
    if (requireAnyAdmin && !isMainAdmin()) {
        return <>{defaultFallback}</>;
    }

    // Check single permission
    if (permission && !hasPermission(permission)) {
        return <>{defaultFallback}</>;
    }

    // Check multiple permissions
    if (permissions && permissions.length > 0) {
        const hasAccess = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);

        if (!hasAccess) {
            return <>{defaultFallback}</>;
        }
    }

    return <>{children}</>;
};

export default PermissionGate;

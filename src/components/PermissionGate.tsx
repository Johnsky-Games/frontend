import React from 'react';
import { usePermission } from '../hooks/usePermission';

interface PermissionGateProps {
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    requireSuperAdmin?: boolean;
    requireAnyAdmin?: boolean;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Component to conditionally render children based on user permissions
 * 
 * @example
 * // Single permission
 * <PermissionGate permission={PERMISSIONS.USERS_EDIT}>
 *   <button>Edit User</button>
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (any)
 * <PermissionGate permissions={[PERMISSIONS.USERS_VIEW, PERMISSIONS.BUSINESSES_VIEW]}>
 *   <Dashboard />
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (all required)
 * <PermissionGate permissions={[...]} requireAll>
 *   <AdminPanel />
 * </PermissionGate>
 * 
 * @example
 * // Super admin only
 * <PermissionGate requireSuperAdmin>
 *   <SystemSettings />
 * </PermissionGate>
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
    permission,
    permissions,
    requireAll = false,
    requireSuperAdmin = false,
    requireAnyAdmin = false,
    fallback = null,
    children
}) => {
    const {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isSuperAdmin,
        hasAdminRole
    } = usePermission();

    // Check super admin requirement
    if (requireSuperAdmin && !isSuperAdmin) {
        return <>{fallback}</>;
    }

    // Check any admin role requirement
    if (requireAnyAdmin && !hasAdminRole) {
        return <>{fallback}</>;
    }

    // Check single permission
    if (permission && !hasPermission(permission)) {
        return <>{fallback}</>;
    }

    // Check multiple permissions
    if (permissions && permissions.length > 0) {
        const hasAccess = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);

        if (!hasAccess) {
            return <>{fallback}</>;
        }
    }

    return <>{children}</>;
};

export default PermissionGate;

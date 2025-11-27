import { useAuth } from '../context/AuthContext';

/**
 * Hook to check user permissions
 * Usage:
 *   const { hasPermission, hasAnyPermission, hasAllPermissions, permissions } = usePermissions();
 *   
 *   if (hasPermission('view_users')) {
 *     // Show users list
 *   }
 */
export function usePermissions() {
    const { user } = useAuth();

    // Debug permissions
    // console.log('👤 usePermissions User:', user);
    // console.log('🔑 User Permissions:', user?.permissions);
    // console.log('👑 Is Admin Collaborator:', user?.is_admin_collaborator);

    /**
     * Check if user has a specific permission
     */
    const hasPermission = (permissionKey: string): boolean => {
        // Main admin (not collaborator) has all permissions
        if (user?.role === 'admin' && !user?.is_admin_collaborator) {
            return true;
        }

        // Check if permission is in user's permission list
        return user?.permissions?.includes(permissionKey) || false;
    };

    /**
     * Check if user has at least one of the specified permissions
     */
    const hasAnyPermission = (permissionKeys: string[]): boolean => {
        // Main admin has all permissions
        if (user?.role === 'admin' && !user?.is_admin_collaborator) {
            return true;
        }

        return permissionKeys.some(key => user?.permissions?.includes(key));
    };

    /**
     * Check if user has all of the specified permissions
     */
    const hasAllPermissions = (permissionKeys: string[]): boolean => {
        // Main admin has all permissions
        if (user?.role === 'admin' && !user?.is_admin_collaborator) {
            return true;
        }

        return permissionKeys.every(key => user?.permissions?.includes(key));
    };

    /**
     * Check if user is a collaborator (not main admin)
     */
    const isCollaborator = (): boolean => {
        return user?.role === 'admin' && user?.is_admin_collaborator === true;
    };

    /**
     * Check if user is main admin (not collaborator)
     */
    const isMainAdmin = (): boolean => {
        return user?.role === 'admin' && !user?.is_admin_collaborator;
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isCollaborator,
        isMainAdmin,
        permissions: user?.permissions || [],
        user
    };
}

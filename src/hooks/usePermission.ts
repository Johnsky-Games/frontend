import { useAuth } from '../context/AuthContext';

// Permission constants (matching backend)
export const PERMISSIONS = {
    // User Management
    USERS_VIEW: 'users.view',
    USERS_CREATE: 'users.create',
    USERS_EDIT: 'users.edit',
    USERS_DELETE: 'users.delete',
    USERS_SUSPEND: 'users.suspend',

    // Business Management
    BUSINESSES_VIEW: 'businesses.view',
    BUSINESSES_EDIT: 'businesses.edit',
    BUSINESSES_DELETE: 'businesses.delete',
    BUSINESSES_SUBSCRIPTIONS: 'businesses.subscriptions',

    // Content Moderation
    CONTENT_VIEW: 'content.view',
    CONTENT_MODERATE: 'content.moderate',
    CONTENT_DELETE: 'content.delete',

    // Analytics
    ANALYTICS_VIEW: 'analytics.view',
    ANALYTICS_EXPORT: 'analytics.export',

    // Admin Management
    ADMINS_VIEW: 'admins.view',
    ADMINS_CREATE: 'admins.create',
    ADMINS_EDIT: 'admins.edit',
    ADMINS_DELETE: 'admins.delete',

    // System
    SYSTEM_SETTINGS: 'system.settings',
    SYSTEM_CONFIG: 'system.config'
};

// Role-based default permissions
const ROLE_PERMISSIONS: Record<string, string[]> = {
    super_admin: Object.values(PERMISSIONS),

    admin: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.USERS_CREATE,
        PERMISSIONS.USERS_EDIT,
        PERMISSIONS.USERS_DELETE,
        PERMISSIONS.USERS_SUSPEND,
        PERMISSIONS.BUSINESSES_VIEW,
        PERMISSIONS.BUSINESSES_EDIT,
        PERMISSIONS.BUSINESSES_DELETE,
        PERMISSIONS.BUSINESSES_SUBSCRIPTIONS,
        PERMISSIONS.CONTENT_VIEW,
        PERMISSIONS.CONTENT_MODERATE,
        PERMISSIONS.CONTENT_DELETE,
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.ANALYTICS_EXPORT,
        PERMISSIONS.SYSTEM_SETTINGS
    ],

    moderator: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.USERS_SUSPEND,
        PERMISSIONS.BUSINESSES_VIEW,
        PERMISSIONS.CONTENT_VIEW,
        PERMISSIONS.CONTENT_MODERATE,
        PERMISSIONS.CONTENT_DELETE
    ],

    support: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.BUSINESSES_VIEW,
        PERMISSIONS.CONTENT_VIEW
    ]
};

export const usePermission = () => {
    const { user } = useAuth();

    const hasPermission = (permission: string): boolean => {
        if (!user || !user.admin_role) return false;

        // Super admin has all permissions
        if (user.admin_role === 'super_admin') return true;

        // Check custom permissions first
        if (user.permissions && Array.isArray(user.permissions)) {
            return user.permissions.includes(permission);
        }

        // Fall back to role-based permissions
        const rolePermissions = ROLE_PERMISSIONS[user.admin_role] || [];
        return rolePermissions.includes(permission);
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
        return permissions.some(permission => hasPermission(permission));
    };

    const hasAllPermissions = (permissions: string[]): boolean => {
        return permissions.every(permission => hasPermission(permission));
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,

        // Convenience checks
        isSuperAdmin: user?.admin_role === 'super_admin',
        isAdmin: user?.admin_role === 'admin',
        isModerator: user?.admin_role === 'moderator',
        isSupport: user?.admin_role === 'support',
        hasAdminRole: !!user?.admin_role,

        // Specific permission checks
        canManageUsers: hasPermission(PERMISSIONS.USERS_EDIT),
        canManageBusinesses: hasPermission(PERMISSIONS.BUSINESSES_EDIT),
        canManageAdmins: hasPermission(PERMISSIONS.ADMINS_VIEW),
        canViewAnalytics: hasPermission(PERMISSIONS.ANALYTICS_VIEW),
        canModerateContent: hasPermission(PERMISSIONS.CONTENT_MODERATE),
    };
};

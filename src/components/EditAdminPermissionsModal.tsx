import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/ApiService';
import { PERMISSIONS } from '../hooks/usePermission';

interface Admin {
    id: number;
    name: string;
    email: string;
    admin_role: 'super_admin' | 'admin' | 'moderator' | 'support';
    permissions: string[] | null;
}

interface EditAdminPermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    admin: Admin | null;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
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

const EditAdminPermissionsModal: React.FC<EditAdminPermissionsModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    admin
}) => {
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<'admin' | 'moderator' | 'support'>('admin');
    const [useCustomPermissions, setUseCustomPermissions] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    useEffect(() => {
        if (admin) {
            setRole(admin.admin_role as 'admin' | 'moderator' | 'support');
            if (admin.permissions && admin.permissions.length > 0) {
                setUseCustomPermissions(true);
                setSelectedPermissions(admin.permissions);
            } else {
                setUseCustomPermissions(false);
                setSelectedPermissions(ROLE_PERMISSIONS[admin.admin_role] || []);
            }
        }
    }, [admin]);

    const handleRoleChange = (newRole: 'admin' | 'moderator' | 'support') => {
        setRole(newRole);
        if (!useCustomPermissions) {
            setSelectedPermissions(ROLE_PERMISSIONS[newRole] || []);
        }
    };

    const handlePermissionToggle = (permission: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!admin) return;

        try {
            setLoading(true);

            const payload: any = {
                admin_role: role
            };

            if (useCustomPermissions) {
                payload.permissions = selectedPermissions;
            } else {
                payload.permissions = null; // Reset to role defaults
            }

            await api.put(`/admin/team/${admin.id}`, payload);

            toast.success('Admin permissions updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Update admin error:', error);
            toast.error(error.response?.data?.message || 'Failed to update admin');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !admin) return null;

    // Group permissions for display
    const permissionGroups = {
        Users: Object.values(PERMISSIONS).filter(p => p.startsWith('users.')),
        Businesses: Object.values(PERMISSIONS).filter(p => p.startsWith('businesses.')),
        Content: Object.values(PERMISSIONS).filter(p => p.startsWith('content.')),
        Analytics: Object.values(PERMISSIONS).filter(p => p.startsWith('analytics.')),
        System: Object.values(PERMISSIONS).filter(p => p.startsWith('system.')),
        Admins: Object.values(PERMISSIONS).filter(p => p.startsWith('admins.'))
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">
                                Edit Permissions: {admin.name}
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4 space-y-6">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange('admin')}
                                    className={`p-3 border-2 rounded-lg text-center transition-colors ${role === 'admin'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">🛡️</div>
                                    <div className="text-sm font-medium">Admin</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange('moderator')}
                                    className={`p-3 border-2 rounded-lg text-center transition-colors ${role === 'moderator'
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">👮</div>
                                    <div className="text-sm font-medium">Moderator</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange('support')}
                                    className={`p-3 border-2 rounded-lg text-center transition-colors ${role === 'support'
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">💬</div>
                                    <div className="text-sm font-medium">Support</div>
                                </button>
                            </div>
                        </div>

                        {/* Custom Permissions Toggle */}
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                            <div>
                                <label htmlFor="useCustomPermissions" className="text-sm font-medium text-gray-900">
                                    Custom Permissions
                                </label>
                                <p className="text-xs text-gray-500">
                                    Override default role permissions
                                </p>
                            </div>
                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input
                                    type="checkbox"
                                    name="useCustomPermissions"
                                    id="useCustomPermissions"
                                    checked={useCustomPermissions}
                                    onChange={(e) => {
                                        setUseCustomPermissions(e.target.checked);
                                        if (!e.target.checked) {
                                            setSelectedPermissions(ROLE_PERMISSIONS[role]);
                                        }
                                    }}
                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                    style={{ right: useCustomPermissions ? '0' : 'auto', left: useCustomPermissions ? 'auto' : '0' }}
                                />
                                <label
                                    htmlFor="useCustomPermissions"
                                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${useCustomPermissions ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                ></label>
                            </div>
                        </div>

                        {/* Permissions Grid */}
                        {useCustomPermissions && (
                            <div className="space-y-4">
                                {Object.entries(permissionGroups).map(([group, permissions]) => (
                                    <div key={group} className="bg-gray-50 p-3 rounded-md">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                            {group}
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {permissions.map(permission => (
                                                <label key={permission} className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPermissions.includes(permission)}
                                                        onChange={() => handlePermissionToggle(permission)}
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">
                                                        {permission.split('.')[1].replace(/_/g, ' ')}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAdminPermissionsModal;

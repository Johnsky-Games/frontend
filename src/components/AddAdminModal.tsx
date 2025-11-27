import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/ApiService';
import { PERMISSIONS } from '../hooks/usePermission';

interface AddAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
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

const AddAdminModal: React.FC<AddAdminModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        admin_role: 'admin' as 'admin' | 'moderator' | 'support'
    });
    const [useCustomPermissions, setUseCustomPermissions] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Update default permissions when role changes
        if (name === 'admin_role' && !useCustomPermissions) {
            setSelectedPermissions(ROLE_PERMISSIONS[value as keyof typeof ROLE_PERMISSIONS] || []);
        }
    };

    const handleRoleChange = (role: 'admin' | 'moderator' | 'support') => {
        setFormData(prev => ({ ...prev, admin_role: role }));
        if (!useCustomPermissions) {
            setSelectedPermissions(ROLE_PERMISSIONS[role] || []);
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

        if (!formData.name || !formData.email || !formData.admin_role) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);

            const payload: any = {
                name: formData.name,
                email: formData.email,
                admin_role: formData.admin_role
            };

            if (useCustomPermissions && selectedPermissions.length > 0) {
                payload.custom_permissions = selectedPermissions;
            }

            const response = await api.post('/admin/team', payload);

            toast.success(
                <div>
                    <p>Admin created successfully!</p>
                    <p className="text-xs mt-1">Temporary password: {response.data.admin.temp_password}</p>
                    <p className="text-xs text-yellow-200">⚠️ Save this password - it won't be shown again!</p>
                </div>,
                { autoClose: 10000 }
            );

            onSuccess();
            onClose();
            resetForm();
        } catch (error: any) {
            console.error('Create admin error:', error);
            toast.error(error.response?.data?.message || 'Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', admin_role: 'admin' });
        setUseCustomPermissions(false);
        setSelectedPermissions(ROLE_PERMISSIONS.admin);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Add New Admin</h3>
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
                    <div className="px-6 py-4 space-y-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="John Doe"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="admin@example.com"
                            />
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Role <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange('admin')}
                                    className={`p-3 border-2 rounded-lg text-center transition-colors ${formData.admin_role === 'admin'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">🛡️</div>
                                    <div className="text-sm font-medium">Admin</div>
                                    <div className="text-xs text-gray-500">Full Access</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange('moderator')}
                                    className={`p-3 border-2 rounded-lg text-center transition-colors ${formData.admin_role === 'moderator'
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">👮</div>
                                    <div className="text-sm font-medium">Moderator</div>
                                    <div className="text-xs text-gray-500">Content Only</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange('support')}
                                    className={`p-3 border-2 rounded-lg text-center transition-colors ${formData.admin_role === 'support'
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">💬</div>
                                    <div className="text-sm font-medium">Support</div>
                                    <div className="text-xs text-gray-500">Read Only</div>
                                </button>
                            </div>
                        </div>

                        {/* Custom Permissions Toggle */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="useCustomPermissions"
                                checked={useCustomPermissions}
                                onChange={(e) => {
                                    setUseCustomPermissions(e.target.checked);
                                    if (!e.target.checked) {
                                        setSelectedPermissions(ROLE_PERMISSIONS[formData.admin_role]);
                                    }
                                }}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="useCustomPermissions" className="ml-2 block text-sm text-gray-900">
                                Customize permissions
                            </label>
                        </div>

                        {/* Permissions Preview */}
                        <div className="bg-gray-50 p-3 rounded-md">
                            <div className="text-sm font-medium text-gray-700 mb-2">
                                Permissions ({useCustomPermissions ? selectedPermissions.length : ROLE_PERMISSIONS[formData.admin_role]?.length || 0})
                            </div>
                            <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                                {(useCustomPermissions ? selectedPermissions : ROLE_PERMISSIONS[formData.admin_role] || [])
                                    .map(p => p.split('.')[0])
                                    .filter((v, i, a) => a.indexOf(v) === i)
                                    .join(', ')}
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="rounded-md bg-blue-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm text-blue-700">
                                        A temporary password will be generated and shown once. Make sure to save it!
                                    </p>
                                </div>
                            </div>
                        </div>
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
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Admin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAdminModal;

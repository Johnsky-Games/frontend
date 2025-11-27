import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import { ArrowLeft, Save, Shield, Check } from 'lucide-react';

interface Permission {
    id: number;
    permission_key: string;
    permission_name: string;
    description: string;
    category: string;
}

interface PermissionsByCategory {
    [category: string]: Permission[];
}

interface Collaborator {
    id: number;
    name: string;
    email: string;
}

const PermissionsManagementPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [collaborator, setCollaborator] = useState<Collaborator | null>(null);
    const [allPermissions, setAllPermissions] = useState<PermissionsByCategory>({});
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [permissionsRes, collabRes, currentPermsRes] = await Promise.all([
                ApiService.get('/admin/permissions'),
                ApiService.get(`/admin/collaborators/${id}`),
                ApiService.get(`/admin/collaborators/${id}/permissions`)
            ]);

            setAllPermissions(permissionsRes.data);
            setCollaborator(collabRes.data);

            // Extract permission keys from current permissions
            const currentKeys = currentPermsRes.data.map((p: Permission) => p.permission_key);
            setSelectedPermissions(currentKeys);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to load permissions');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePermission = (permissionKey: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionKey)
                ? prev.filter(k => k !== permissionKey)
                : [...prev, permissionKey]
        );
    };

    const handleToggleCategory = (category: string, checked: boolean) => {
        const categoryPermissions = allPermissions[category].map(p => p.permission_key);

        if (checked) {
            // Add all permissions from this category
            setSelectedPermissions(prev => [
                ...prev,
                ...categoryPermissions.filter(k => !prev.includes(k))
            ]);
        } else {
            // Remove all permissions from this category
            setSelectedPermissions(prev =>
                prev.filter(k => !categoryPermissions.includes(k))
            );
        }
    };

    const isCategoryFullySelected = (category: string) => {
        const categoryPermissions = allPermissions[category].map(p => p.permission_key);
        return categoryPermissions.every(k => selectedPermissions.includes(k));
    };

    const isCategoryPartiallySelected = (category: string) => {
        const categoryPermissions = allPermissions[category].map(p => p.permission_key);
        const selectedCount = categoryPermissions.filter(k => selectedPermissions.includes(k)).length;
        return selectedCount > 0 && selectedCount < categoryPermissions.length;
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await ApiService.post(`/admin/collaborators/${id}/permissions`, {
                permissions: selectedPermissions
            });
            alert('Permissions updated successfully');
            navigate('/admin/collaborators');
        } catch (error) {
            console.error('Error saving permissions:', error);
            alert('Failed to save permissions');
        } finally {
            setSaving(false);
        }
    };

    const getCategoryDisplayName = (category: string) => {
        const names: { [key: string]: string } = {
            dashboard: 'Dashboard',
            users: 'Users Management',
            businesses: 'Businesses Management',
            appointments: 'Appointments Management',
            services: 'Services Management',
            reports: 'Reports & Analytics',
            admin: 'Admin & Collaborators'
        };
        return names[category] || category;
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            dashboard: 'bg-purple-50 border-purple-200',
            users: 'bg-blue-50 border-blue-200',
            businesses: 'bg-green-50 border-green-200',
            appointments: 'bg-yellow-50 border-yellow-200',
            services: 'bg-pink-50 border-pink-200',
            reports: 'bg-indigo-50 border-indigo-200',
            admin: 'bg-red-50 border-red-200'
        };
        return colors[category] || 'bg-gray-50 border-gray-200';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin/collaborators')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back to Collaborators
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <Shield className="mr-3 h-8 w-8 text-blue-600" />
                            Manage Permissions
                        </h1>
                        {collaborator && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-600">
                                    Collaborator: <span className="font-semibold">{collaborator.name}</span>
                                </p>
                                <p className="text-sm text-gray-500">{collaborator.email}</p>
                                <p className="text-sm text-blue-600 mt-1">
                                    {selectedPermissions.length} permissions selected
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        <Save className="mr-2 h-5 w-5" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Permissions by Category */}
            <div className="space-y-6">
                {Object.entries(allPermissions).map(([category, permissions]) => {
                    const isFullySelected = isCategoryFullySelected(category);
                    const isPartiallySelected = isCategoryPartiallySelected(category);

                    return (
                        <div
                            key={category}
                            className={`border-2 rounded-lg p-6 ${getCategoryColor(category)}`}
                        >
                            {/* Category Header */}
                            <div className="flex items-center justify-between mb-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isFullySelected}
                                        ref={(el) => {
                                            if (el) {
                                                el.indeterminate = isPartiallySelected && !isFullySelected;
                                            }
                                        }}
                                        onChange={(e) => handleToggleCategory(category, e.target.checked)}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-3 text-lg font-semibold text-gray-900">
                                        {getCategoryDisplayName(category)}
                                    </span>
                                </label>
                                <span className="text-sm text-gray-500">
                                    {permissions.filter(p => selectedPermissions.includes(p.permission_key)).length} / {permissions.length}
                                </span>
                            </div>

                            {/* Individual Permissions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                                {permissions.map((permission) => (
                                    <label
                                        key={permission.id}
                                        className="flex items-start cursor-pointer group"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedPermissions.includes(permission.permission_key)}
                                            onChange={() => handleTogglePermission(permission.permission_key)}
                                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <div className="ml-3">
                                            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                                {permission.permission_name}
                                            </span>
                                            <p className="text-xs text-gray-500">{permission.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary Footer */}
            <div className="mt-8 bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Check className="h-6 w-6 text-green-600 mr-2" />
                        <span className="text-gray-700">
                            <span className="font-bold text-gray-900">{selectedPermissions.length}</span> permissions selected
                        </span>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => navigate('/admin/collaborators')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermissionsManagementPage;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/ApiService';
import { usePermission, PERMISSIONS } from '../hooks/usePermission';
import PermissionGate from '../components/PermissionGate';
import AddAdminModal from '../components/AddAdminModal';
import EditAdminPermissionsModal from '../components/EditAdminPermissionsModal';

interface Admin {
    id: number;
    name: string;
    email: string;
    admin_role: 'super_admin' | 'admin' | 'moderator' | 'support';
    permissions: string[] | null;
    created_by_admin_id: number | null;
    last_login: string | null;
    created_at: string;
}

const AdminTeamPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { isSuperAdmin, hasPermission } = usePermission();
    const [loading, setLoading] = useState(true);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

    useEffect(() => {
        if (user && hasPermission(PERMISSIONS.ADMINS_VIEW)) {
            fetchAdmins();
        }
    }, [user]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/team');
            setAdmins(response.data.admins || []);
        } catch (error: any) {
            console.error('Fetch admins error:', error);
            toast.error('Failed to load admin team');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAdmin = async (adminId: number, adminName: string) => {
        if (!window.confirm(`Are you sure you want to remove ${adminName} from the admin team?`)) {
            return;
        }

        try {
            await api.delete(`/admin/team/${adminId}`);
            toast.success('Admin removed successfully');
            fetchAdmins();
        } catch (error: any) {
            console.error('Remove admin error:', error);
            toast.error(error.response?.data?.message || 'Failed to remove admin');
        }
    };

    const handleEditAdmin = (admin: Admin) => {
        setSelectedAdmin(admin);
        setShowEditModal(true);
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'super_admin':
                return 'bg-red-100 text-red-800';
            case 'admin':
                return 'bg-blue-100 text-blue-800';
            case 'moderator':
                return 'bg-purple-100 text-purple-800';
            case 'support':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'super_admin':
                return '👑';
            case 'admin':
                return '🛡️';
            case 'moderator':
                return '👮';
            case 'support':
                return '💬';
            default:
                return '👤';
        }
    };

    const getRoleLabel = (role: string) => {
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    if (!user || !hasPermission(PERMISSIONS.ADMINS_VIEW)) {
        return <Navigate to="/dashboard" replace />;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Group admins by role
    const superAdmins = admins.filter(a => a.admin_role === 'super_admin');
    const regularAdmins = admins.filter(a => a.admin_role === 'admin');
    const moderators = admins.filter(a => a.admin_role === 'moderator');
    const supportAgents = admins.filter(a => a.admin_role === 'support');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Admin Team Management</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your admin team members and their permissions
                    </p>
                </div>
                <PermissionGate requireSuperAdmin>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Admin
                    </button>
                </PermissionGate>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Admins</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{admins.length}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Super Admins</dt>
                        <dd className="mt-1 text-3xl font-semibold text-red-600">{superAdmins.length}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Admins</dt>
                        <dd className="mt-1 text-3xl font-semibold text-blue-600">{regularAdmins.length}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Moderators</dt>
                        <dd className="mt-1 text-3xl font-semibold text-purple-600">{moderators.length}</dd>
                    </div>
                </div>
            </div>

            {/* Admin Lists */}
            <div className="space-y-6">
                {/* Super Admins */}
                {superAdmins.length > 0 && (
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                👑 Super Admins ({superAdmins.length})
                            </h3>
                            <ul className="divide-y divide-gray-200">
                                {superAdmins.map((admin) => (
                                    <li key={admin.id} className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center">
                                                    <span className="text-2xl mr-3">{getRoleIcon(admin.admin_role)}</span>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {admin.name}
                                                            {admin.id === user.id && (
                                                                <span className="ml-2 text-xs text-gray-500">(You)</span>
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{admin.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(admin.admin_role)}`}>
                                                    {getRoleLabel(admin.admin_role)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Full Access
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Regular Admins */}
                {regularAdmins.length > 0 && (
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                🛡️ Admins ({regularAdmins.length})
                            </h3>
                            <ul className="divide-y divide-gray-200">
                                {regularAdmins.map((admin) => (
                                    <AdminCard
                                        key={admin.id}
                                        admin={admin}
                                        currentUserId={user.id}
                                        isSuperAdmin={isSuperAdmin}
                                        onRemove={handleRemoveAdmin}
                                        onEdit={handleEditAdmin}
                                        getRoleIcon={getRoleIcon}
                                        getRoleBadgeColor={getRoleBadgeColor}
                                        getRoleLabel={getRoleLabel}
                                    />
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Moderators */}
                {moderators.length > 0 && (
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                👮 Moderators ({moderators.length})
                            </h3>
                            <ul className="divide-y divide-gray-200">
                                {moderators.map((admin) => (
                                    <AdminCard
                                        key={admin.id}
                                        admin={admin}
                                        currentUserId={user.id}
                                        isSuperAdmin={isSuperAdmin}
                                        onRemove={handleRemoveAdmin}
                                        onEdit={handleEditAdmin}
                                        getRoleIcon={getRoleIcon}
                                        getRoleBadgeColor={getRoleBadgeColor}
                                        getRoleLabel={getRoleLabel}
                                    />
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Support Agents */}
                {supportAgents.length > 0 && (
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                💬 Support Agents ({supportAgents.length})
                            </h3>
                            <ul className="divide-y divide-gray-200">
                                {supportAgents.map((admin) => (
                                    <AdminCard
                                        key={admin.id}
                                        admin={admin}
                                        currentUserId={user.id}
                                        isSuperAdmin={isSuperAdmin}
                                        onRemove={handleRemoveAdmin}
                                        onEdit={handleEditAdmin}
                                        getRoleIcon={getRoleIcon}
                                        getRoleBadgeColor={getRoleBadgeColor}
                                        getRoleLabel={getRoleLabel}
                                    />
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Admin Modal */}
            <AddAdminModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchAdmins}
            />

            {/* Edit Admin Modal */}
            <EditAdminPermissionsModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={fetchAdmins}
                admin={selectedAdmin}
            />
        </div>
    );
};

// Admin Card Component
interface AdminCardProps {
    admin: Admin;
    currentUserId: number;
    isSuperAdmin: boolean;
    onRemove: (id: number, name: string) => void;
    onEdit?: (admin: Admin) => void;
    getRoleIcon: (role: string) => string;
    getRoleBadgeColor: (role: string) => string;
    getRoleLabel: (role: string) => string;
}

const AdminCard: React.FC<AdminCardProps> = ({
    admin,
    currentUserId,
    isSuperAdmin,
    onRemove,
    onEdit,
    getRoleIcon,
    getRoleBadgeColor,
    getRoleLabel
}) => {
    return (
        <li className="py-4">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center">
                        <span className="text-2xl mr-3">{getRoleIcon(admin.admin_role)}</span>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {admin.name}
                                {admin.id === currentUserId && (
                                    <span className="ml-2 text-xs text-gray-500">(You)</span>
                                )}
                            </p>
                            <p className="text-sm text-gray-500">{admin.email}</p>
                            {admin.last_login && (
                                <p className="text-xs text-gray-400">
                                    Last login: {new Date(admin.last_login).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(admin.admin_role)}`}>
                        {getRoleLabel(admin.admin_role)}
                    </span>
                    {isSuperAdmin && admin.id !== currentUserId && (
                        <>
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(admin)}
                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                >
                                    Edit
                                </button>
                            )}
                            <button
                                onClick={() => onRemove(admin.id, admin.name)}
                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                                Remove
                            </button>
                        </>
                    )}
                </div>
            </div>
        </li>
    );
};

export default AdminTeamPage;

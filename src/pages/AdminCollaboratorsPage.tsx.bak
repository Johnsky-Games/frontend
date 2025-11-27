import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/ApiService';
import { usePermission, PERMISSIONS } from '../hooks/usePermission';

interface ActivityLog {
    id: number;
    admin_id: number;
    admin_name: string;
    admin_role: string;
    action_type: string;
    target_type: string;
    target_id: string;
    details: any;
    ip_address: string;
    created_at: string;
}

const AdminActivityLogPage: React.FC = () => {
    const { user } = useAuth();
    const { hasPermission } = usePermission();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [admins, setAdmins] = useState<{ id: number; name: string; role: string }[]>([]);
    const [filterAdminId, setFilterAdminId] = useState<string>('all');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterAction, setFilterAction] = useState<string>('all');

    useEffect(() => {
        if (user && hasPermission(PERMISSIONS.SYSTEM_SETTINGS)) {
            fetchLogs();
            fetchAdmins();
        }
    }, [user]);

    useEffect(() => {
        if (user && hasPermission(PERMISSIONS.SYSTEM_SETTINGS)) {
            fetchLogs();
        }
    }, [filterAdminId, filterRole, filterAction]);

    const fetchAdmins = async () => {
        try {
            // We can reuse the collaborators endpoint or a general admin endpoint
            // For now, let's assume we want to filter by any admin user
            // We might need a specific endpoint for "all admins" if /admin/collaborators only returns collaborators
            // But for now, let's try to fetch collaborators as a start, or if we have an endpoint for all team members
            const response = await api.get('/admin/team'); // Assuming this exists or we use collaborators
            // If /admin/team doesn't exist, we might need to create it or use /admin/collaborators
            // Let's check if we have a route for getting all admins. 
            // Based on previous tasks, we have AdminTeamPage, so likely there is an endpoint.
            setAdmins(response.data.admins || []);
        } catch (error) {
            console.error('Fetch admins error:', error);
        }
    };

    const fetchLogs = async () => {
        try {
            setLoading(true);
            let url = '/admin/team/logs?';
            if (filterRole !== 'all') url += `&role=${filterRole}`; // Note: Backend might expect 'admin_role' or filter by joining users
            // The backend AdminActivityLog.getLog supports admin_id, action, target_type
            // It doesn't explicitly support filtering by role in the SQL query provided in the context, 
            // but it joins with users table. 
            // Wait, the backend getLog method DOES NOT filter by role in the SQL. 
            // It filters by admin_id, action, target_type.
            // So filtering by role must be done on frontend or we need to update backend.
            // The current frontend implementation filters by role on the client side (lines 75-79).
            // We should keep client-side filtering for role if backend doesn't support it, 
            // but for admin_id we should pass it to backend.

            const params = new URLSearchParams();
            if (filterAdminId !== 'all') params.append('admin_id', filterAdminId);
            if (filterAction !== 'all') params.append('action', filterAction);

            const response = await api.get(`/admin/team/logs?${params.toString()}`);
            setLogs(response.data.logs || []);
        } catch (error: any) {
            console.error('Fetch logs error:', error);
            toast.error('Failed to load activity logs');
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes('CREATE')) return 'text-green-600 bg-green-100';
        if (action.includes('UPDATE') || action.includes('EDIT')) return 'text-blue-600 bg-blue-100';
        if (action.includes('DELETE') || action.includes('REMOVE')) return 'text-red-600 bg-red-100';
        if (action.includes('LOGIN')) return 'text-purple-600 bg-purple-100';
        if (action.includes('PERMISSIONS')) return 'text-yellow-600 bg-yellow-100';
        return 'text-gray-600 bg-gray-100';
    };

    const formatDetails = (details: any) => {
        if (!details) return '-';
        try {
            // If details is a string, try to parse it (though it should be an object from API)
            const data = typeof details === 'string' ? JSON.parse(details) : details;
            return (
                <pre className="text-xs text-gray-500 overflow-x-auto max-w-xs">
                    {JSON.stringify(data, null, 2)}
                </pre>
            );
        } catch (e) {
            return String(details);
        }
    };

    if (!user || !hasPermission(PERMISSIONS.SYSTEM_SETTINGS)) {
        return <Navigate to="/dashboard" replace />;
    }

    // Client-side filtering for role since backend might not support it directly in the query yet
    // (or we can rely on the backend if we updated it, but let's be safe)
    const filteredLogs = logs.filter(log => {
        if (filterRole !== 'all' && log.admin_role !== filterRole) return false;
        return true;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Admin Activity Log</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Audit trail of all administrative actions
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Admin</label>
                        <select
                            value={filterAdminId}
                            onChange={(e) => setFilterAdminId(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="all">All Admins</option>
                            {admins.map(admin => (
                                <option key={admin.id} value={admin.id}>
                                    {admin.name} ({admin.role})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="all">All Roles</option>
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                            <option value="support">Support</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Action</label>
                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="all">All Actions</option>
                            <option value="CREATE">Create</option>
                            <option value="UPDATE">Update</option>
                            <option value="DELETE">Delete</option>
                            <option value="LOGIN">Login</option>
                            <option value="ASSIGN_PERMISSIONS">Assign Permissions</option>
                            <option value="REVOKE_PERMISSIONS">Revoke Permissions</option>
                            <option value="CHANGE_PASSWORD">Change Password</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Admin
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Target
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Details
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date & IP
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="text-sm font-medium text-gray-900">{log.admin_name}</div>
                                                </div>
                                                <div className="text-xs text-gray-500">{log.admin_role}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action_type)}`}>
                                                    {log.action_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{log.target_type}</div>
                                                <div className="text-xs text-gray-500">ID: {log.target_id}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDetails(log.details)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>{new Date(log.created_at).toLocaleString()}</div>
                                                <div className="text-xs text-gray-400">{log.ip_address}</div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No activity logs found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminActivityLogPage;

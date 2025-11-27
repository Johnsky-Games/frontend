import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/ApiService';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import { usePermissions } from '../hooks/usePermissions';
import AccessDenied from '../components/AccessDenied';

interface User {
  id: number;
  business_id: number | null;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  email_verified: boolean;
  status: string;
  created_at: string;
}

const AdminUserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const { hasPermission, isMainAdmin } = usePermissions();

  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    totalPages: 0,
    currentPage: 1
  });
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Handle search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Initial load
  useEffect(() => {
    if (isMainAdmin() || hasPermission('view_users')) {
      fetchUsers(true);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch on filter/pagination change
  useEffect(() => {
    if ((isMainAdmin() || hasPermission('view_users')) && !loading) {
      fetchUsers(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.role, filters.status, pagination.offset]);

  const fetchUsers = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setIsFetching(true);

      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });

      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (debouncedSearch) params.append('search', debouncedSearch);

      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.users || []);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset pagination on filter change
    if (name !== 'search') {
      setPagination(prev => ({ ...prev, offset: 0 }));
    }
  };

  // Reset pagination when search actually changes (debounced)
  useEffect(() => {
    setPagination(prev => ({ ...prev, offset: 0 }));
  }, [debouncedSearch]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by debounce/effect
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleRoleChange = async (userId: number, newRole: string, currentRole: string) => {
    if (newRole === currentRole) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to change this user's role to ${newRole}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!'
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/admin/users/${userId}`, { role: newRole });

        // Update local state
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

        toast.success(`User role updated to ${newRole}`);
      } catch (error) {
        console.error('Error updating user role:', error);
        toast.error('Failed to update user role');
        // Revert change in UI if needed (though select value is controlled by user state which wasn't updated yet if we didn't do it above)
        // Actually, since we are using the select value from the user object in the map, we need to force a re-render or just let it be.
        // But since we only update state on success, the select will revert automatically if we force update, 
        // but here we are just not updating the state, so it should stay as is? 
        // Wait, the select is controlled by `user.role`. If we don't update state, it stays at old value.
        // But the user changed the select. 
        // Ah, the select onChange triggers this function. 
        // If we don't update state, the select value won't change visually if it's a controlled component tied to `user.role`.
        // But here `value={user.role}`. So if we don't update `users` state, it will snap back.
      }
    }
  };

  const handleStatusChange = async (userId: number, newStatus: string, currentStatus: string) => {
    if (newStatus === currentStatus) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to change this user's status to ${newStatus}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!'
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/admin/users/${userId}`, { status: newStatus });

        // Update local state
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));

        toast.success(`User status updated to ${newStatus}`);
      } catch (error) {
        console.error('Error updating user status:', error);
        toast.error('Failed to update user status');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isMainAdmin() && !hasPermission('view_users')) {
    return <AccessDenied requiredPermission="view_users" />;
  }

  // The original check for user.role !== 'admin' is now covered by the usePermissions hook.
  // If a non-admin user somehow reaches here without 'view_users' permission, AccessDenied will handle it.
  // If they have 'view_users' but are not an admin, they are allowed to view.
  // If the user object itself is null (not logged in), useAuth should redirect or prevent access earlier.
  // However, if we want to explicitly redirect to login for *any* non-admin, non-permissioned user,
  // we can keep a modified version of the original check.
  // For now, based on the instruction, the AccessDenied component is the primary gate.
  // The instruction removed the original `if (!user || user.role !== 'admin')` block, so I will remove it.

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Admin - User Management</h1>
        <p className="mt-1 text-sm text-gray-500">Manage all users across the platform</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="business_owner">Business Owner</option>
              <option value="client">Client</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name or email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value, user.role)}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'business_owner' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}
                      >
                        <option value="client">Client</option>
                        <option value="business_owner">Business Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value, user.status)}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email_verified ? (
                        <span className="text-green-500">✓ Verified</span>
                      ) : (
                        <span className="text-red-500">✗ Not verified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.business_id ? `ID: ${user.business_id}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={`/admin/users/${user.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/admin/users/${user.id}`;
                        }}
                      >
                        View Details
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{pagination.offset + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.offset + pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </div>
            </div>
            <div className="flex">
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                disabled={pagination.currentPage <= 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${pagination.currentPage <= 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: Math.min(prev.total - prev.limit, prev.offset + prev.limit) }))}
                disabled={pagination.currentPage >= pagination.totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${pagination.currentPage >= pagination.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagementPage;
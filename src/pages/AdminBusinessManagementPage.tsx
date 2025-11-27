import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { Navigate as NavigateComponent, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { usePermissions } from '../hooks/usePermissions';
import AccessDenied from '../components/AccessDenied';
import api from '../services/ApiService';

interface Business {
  id: number;
  owner_id: number;
  owner_name: string;
  name: string;
  description: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip_code: string | null;
  category: string | null;
  is_active: boolean;
  is_verified: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  subscription_status?: string;
  subscription_plan?: string;
  created_at: string;
  updated_at: string;
}

const AdminBusinessManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 12,
    offset: 0,
    totalPages: 0,
    currentPage: 1
  });
  const [filters, setFilters] = useState({
    verification_status: '',
    is_active: '',
    category: '',
    search: ''
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const { hasPermission, isMainAdmin } = usePermissions();

  // Handle search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Initial load
  useEffect(() => {
    if (isMainAdmin() || hasPermission('view_businesses')) {
      fetchBusinesses(true);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch on filter/pagination change
  useEffect(() => {
    if ((isMainAdmin() || hasPermission('view_businesses')) && !loading) {
      fetchBusinesses(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.verification_status, filters.is_active, filters.category, pagination.offset]);

  const fetchBusinesses = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setIsFetching(true);

      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });

      if (filters.verification_status) params.append('verification_status', filters.verification_status);
      if (filters.is_active) params.append('is_active', filters.is_active);
      if (filters.category) params.append('category', filters.category);
      if (debouncedSearch) params.append('search', debouncedSearch);

      const response = await api.get(`/admin/businesses-data?${params}`);
      setBusinesses(response.data.businesses || []);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error('Failed to load businesses');
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

    if (name !== 'search') {
      setPagination(prev => ({ ...prev, offset: 0 }));
    }
  };

  useEffect(() => {
    setPagination(prev => ({ ...prev, offset: 0 }));
  }, [debouncedSearch]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleChangeStatus = async (businessId: number, newStatus: 'approved' | 'rejected' | 'pending') => {
    const result = await Swal.fire({
      title: 'Confirm Status Change',
      text: `Set verification to ${newStatus}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it!'
    });

    if (!result.isConfirmed) return;

    try {
      await api.patch(`/admin/businesses/${businessId}/status`, { status: newStatus });
      toast.success(`Verification status updated to ${newStatus}`);
      fetchBusinesses(false);
    } catch (error: any) {
      console.error('Error changing status:', error);
      toast.error(error.response?.data?.message || 'Failed to change status');
    }
  };

  const handleChangeActiveStatus = async (businessId: number, isActive: boolean) => {
    const result = await Swal.fire({
      title: 'Confirm Status Change',
      text: `${isActive ? 'Activate' : 'Suspend'} this business?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it!'
    });

    if (!result.isConfirmed) return;

    try {
      await api.patch(`/admin/businesses/${businessId}/active`, { is_active: isActive });
      toast.success(`Business ${isActive ? 'activated' : 'suspended'} successfully`);
      fetchBusinesses(false);
    } catch (error: any) {
      console.error('Error changing active status:', error);
      toast.error(error.response?.data?.message || 'Failed to change status');
    }
  };

  const handleViewBusiness = (businessId: number) => {
    navigate(`/admin/businesses/${businessId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isMainAdmin() && !hasPermission('view_businesses')) {
    return <AccessDenied requiredPermission="view_businesses" />;
  }

  if (!user || user.role !== 'admin') {
    return <NavigateComponent to="/login" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Businesses Management</h1>
        <p className="mt-1 text-sm text-gray-500">{pagination.total} total businesses</p>
      </div>

      {/* Compact Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            name="verification_status"
            value={filters.verification_status}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Verifications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            name="is_active"
            value={filters.is_active}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Suspended</option>
          </select>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="beauty_salon">Beauty Salon</option>
            <option value="barber_shop">Barber Shop</option>
            <option value="spa">Spa</option>
            <option value="nail_salon">Nail Salon</option>
            <option value="hair_salon">Hair Salon</option>
          </select>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search businesses..."
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Business Cards Grid */}
      {isFetching && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {businesses.length > 0 ? (
          businesses.map((business) => (
            <div key={business.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-5">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{business.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{business.owner_name}</p>
                </div>
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${business.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                  {business.is_active ? 'Active' : 'Suspended'}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <span className="font-medium w-20">Email:</span>
                  <span className="truncate">{business.email}</span>
                </div>
                {business.phone && (
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium w-20">Phone:</span>
                    <span>{business.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <span className="font-medium w-20">Location:</span>
                  <span className="truncate">{business.city && business.state ? `${business.city}, ${business.state}` : 'N/A'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="font-medium w-20">Created:</span>
                  <span>{formatDate(business.created_at)}</span>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${business.verification_status === 'approved' ? 'bg-green-100 text-green-800' :
                  business.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                  {business.verification_status.charAt(0).toUpperCase() + business.verification_status.slice(1)}
                </span>
                {business.subscription_plan && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {business.subscription_plan.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewBusiness(business.id)}
                    className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    View Details
                  </button>
                  {(isMainAdmin() || hasPermission('manage_businesses')) && business.verification_status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleChangeStatus(business.id, 'approved')}
                        className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                        title="Approve"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleChangeStatus(business.id, 'rejected')}
                        className="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                        title="Reject"
                      >
                        ✗
                      </button>
                    </>
                  )}
                </div>
                {(isMainAdmin() || hasPermission('manage_businesses')) && (
                  <button
                    onClick={() => handleChangeActiveStatus(business.id, !business.is_active)}
                    className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${business.is_active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                  >
                    {business.is_active ? '🚫 Suspend' : '✓ Activate'}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No businesses found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
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
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{pagination.offset + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.offset + pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                  disabled={pagination.currentPage <= 1}
                  className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${pagination.currentPage <= 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, offset: Math.min(prev.total - prev.limit, prev.offset + prev.limit) }))}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${pagination.currentPage >= pagination.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBusinessManagementPage;
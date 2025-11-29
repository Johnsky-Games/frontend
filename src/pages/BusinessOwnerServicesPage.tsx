import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import api from '../services/ApiService';

interface Service {
  id: number;
  business_id: number;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  category: string | null;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const BusinessOwnerServicesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    is_active: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 12
  });

  useEffect(() => {
    if (user?.role === 'business_owner') {
      fetchServices();
    } else {
      setLoading(false);
    }
  }, [user, filters, pagination.current_page]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: (pagination.current_page || 1).toString(),
        limit: (pagination.items_per_page || 12).toString(),
      });

      if (filters.category) params.append('category', filters.category);
      if (filters.is_active) params.append('is_active', filters.is_active);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/business-owner/services?${params}`);

      if (response.data.code === 'SUCCESS') {
        setServices(response.data.services || []);
        setPagination(response.data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_items: 0,
          items_per_page: 12
        });
      } else {
        setError(response.data.message || 'Failed to load services');
      }
    } catch (error: any) {
      console.error('Business owner services error:', error);
      setError(error.response?.data?.message || 'Failed to get services');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleServiceStatus = async (serviceId: number, currentStatus: boolean) => {
    try {
      const response = await api.put(`/business-owner/services/${serviceId}/toggle-status`, {
        is_active: !currentStatus
      });

      if (response.data.code === 'SUCCESS') {
        setServices(prev => prev.map(service =>
          service.id === serviceId ? { ...service, is_active: !currentStatus } : service
        ));
        toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(response.data.message || 'Failed to update service status');
      }
    } catch (error: any) {
      console.error('Toggle service status error:', error);
      toast.error(error.response?.data?.message || 'Failed to update service status');
    }
  };

  const handleDeleteService = async (serviceId: number, serviceName: string) => {
    const result = await Swal.fire({
      title: 'Delete Service?',
      text: `Are you sure you want to delete "${serviceName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await api.delete(`/business-owner/services/${serviceId}`);

      if (response.data.code === 'SUCCESS') {
        setServices(prev => prev.filter(service => service.id !== serviceId));
        toast.success('Service deleted successfully');
      } else {
        toast.error(response.data.message || 'Failed to delete service');
      }
    } catch (error: any) {
      console.error('Delete service error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete service');
    }
  };

  const handleEditService = (serviceId: number) => {
    navigate(`/business-owner/services/${serviceId}/edit`);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'business_owner') {
    return <Navigate to="/login" replace />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Error Loading Services</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchServices}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Business Services</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{pagination.total_items} total services</p>
        </div>
        <button
          onClick={() => navigate('/business-owner/services/create')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          + Create New Service
        </button>
      </div>

      {/* Compact Filters */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Categories</option>
            <option value="hair">Hair Services</option>
            <option value="nails">Nail Services</option>
            <option value="spa">Spa Services</option>
            <option value="beauty">Beauty Treatments</option>
            <option value="massage">Massage</option>
            <option value="facial">Facial</option>
            <option value="waxing">Waxing</option>
            <option value="other">Other</option>
          </select>
          <select
            name="is_active"
            value={filters.is_active}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search services..."
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {services.length > 0 ? (
          services.map((service) => (
            <div key={service.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-5">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{service.name}</h3>
                  {service.category && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{service.category.replace('_', ' ')}</p>
                  )}
                </div>
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${service.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Description */}
              {service.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{service.description}</p>
              )}

              {/* Info */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{service.duration} mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Price:</span>
                  <span className="font-medium text-gray-900 dark:text-white">${Number(service.price).toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditService(service.id)}
                    className="flex-1 bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id, service.name)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
                <button
                  onClick={() => handleToggleServiceStatus(service.id, service.is_active)}
                  className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${service.is_active
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50'
                    }`}
                >
                  {service.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">No services found</p>
            <button
              onClick={() => navigate('/business-owner/services/create')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-secondary-700 dark:text-secondary-200 bg-secondary-100 dark:bg-secondary-900/30 hover:bg-secondary-200 dark:hover:bg-secondary-900/50"
            >
              + Create your first service
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total_items > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination(prev => ({ ...prev, current_page: Math.max(1, prev.current_page - 1) }))}
              disabled={pagination.current_page <= 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${pagination.current_page <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, current_page: Math.min(prev.total_pages, prev.current_page + 1) }))}
              disabled={pagination.current_page >= pagination.total_pages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${pagination.current_page >= pagination.total_pages
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
                Showing <span className="font-medium">{((pagination.current_page - 1) * pagination.items_per_page) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)}</span> of{' '}
                <span className="font-medium">{pagination.total_items}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: Math.max(1, prev.current_page - 1) }))}
                  disabled={pagination.current_page <= 1}
                  className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${pagination.current_page <= 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: Math.min(prev.total_pages, prev.current_page + 1) }))}
                  disabled={pagination.current_page >= pagination.total_pages}
                  className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${pagination.current_page >= pagination.total_pages
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

export default BusinessOwnerServicesPage;
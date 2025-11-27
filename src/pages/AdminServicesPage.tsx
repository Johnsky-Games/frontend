import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { usePermissions } from '../hooks/usePermissions';
import AccessDenied from '../components/AccessDenied';
import api from '../services/ApiService';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Service {
  id: number;
  business_id: number;
  business_name: string;
  business_owner: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  category: string | null;
  image: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminServicesPage: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    totalPages: 0,
    currentPage: 1
  });
  const [filters, setFilters] = useState({
    category: '',
    active: '',
    businessId: '',
    search: ''
  });

  // Modal state for viewing service details
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { hasPermission, isMainAdmin } = usePermissions();

  useEffect(() => {
    if (isMainAdmin() || hasPermission('view_services')) {
      fetchServices();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if ((isMainAdmin() || hasPermission('view_services')) && !loading) {
      const timer = setTimeout(() => {
        fetchServices(false);
      }, 500); // Debounce search
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.offset]);

  const fetchServices = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setIsFetching(true);

      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });

      if (filters.category) params.append('category', filters.category);
      if (filters.active) params.append('is_active', filters.active);
      if (filters.businessId) params.append('business_id', filters.businessId);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/admin/services-data?${params}`);
      setServices(response.data.services || []);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching services:', error);
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
    // Reset to first page on filter change
    if (name !== 'search') {
      setPagination(prev => ({ ...prev, offset: 0 }));
    }
  };

  const openServiceModal = (service: Service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const closeServiceModal = () => {
    setShowDeleteModal(false);
    setSelectedService(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isMainAdmin() && !hasPermission('view_services')) {
    return <AccessDenied requiredPermission="view_services" />;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor all services offered across the platform
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => fetchServices(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Refresh Data
            </button>
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search services..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Categories</option>
              <option value="hair">Hair Services</option>
              <option value="nails">Nail Services</option>
              <option value="spa">Spa Services</option>
              <option value="skin">Skin Care</option>
              <option value="beauty">Beauty Treatments</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              name="active"
              value={filters.active}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Business ID Filter */}
          <div>
            <input
              type="text"
              name="businessId"
              placeholder="Filter by Business ID"
              value={filters.businessId}
              onChange={handleFilterChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Info
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.length > 0 ? (
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {service.image ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={service.image} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium text-sm">
                                {service.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-500">{service.category || 'Uncategorized'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.business_name}</div>
                      <div className="text-sm text-gray-500">ID: {service.business_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {service.duration} min
                        </div>
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <CurrencyDollarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-green-500" />
                          ${(Number(service.price) || 0).toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px - 2 inline - flex text - xs leading - 5 font - semibold rounded - full ${service.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        } `}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openServiceModal(service)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end w-full"
                      >
                        <EyeIcon className="h-5 w-5 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <FunnelIcon className="h-12 w-12" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter options.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                    className={`relative inline - flex items - center px - 2 py - 2 rounded - l - md border border - gray - 300 bg - white text - sm font - medium ${pagination.currentPage <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      } `}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, offset: Math.min(prev.total - prev.limit, prev.offset + prev.limit) }))}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className={`relative inline - flex items - center px - 2 py - 2 rounded - r - md border border - gray - 300 bg - white text - sm font - medium ${pagination.currentPage >= pagination.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      } `}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Service Details Modal */}
      {showDeleteModal && selectedService && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeServiceModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <EyeIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Service Details
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Service Name</label>
                        <p className="mt-1 text-sm text-gray-900 font-semibold">{selectedService.name}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Description</label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
                          {selectedService.description || 'No description provided.'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Price</label>
                          <p className="mt-1 text-sm text-gray-900">${(Number(selectedService.price) || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Duration</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedService.duration} minutes</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Category</label>
                          <p className="mt-1 text-sm text-gray-900 capitalize">{selectedService.category || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Status</label>
                          <span className={`mt - 1 inline - flex text - xs leading - 5 font - semibold rounded - full ${selectedService.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            } `}>
                            {selectedService.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <label className="block text-sm font-medium text-gray-500">Business Info</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedService.business_name}</p>
                        <p className="text-xs text-gray-500">Owner: {selectedService.business_owner}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeServiceModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServicesPage;
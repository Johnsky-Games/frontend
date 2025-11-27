import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/ApiService';

interface Service {
  id: number;
  business_id: number;
  business_name: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  category: string | null;
  image: string | null;
  is_active: boolean;
  created_at: string;
}

const ClientServicesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();

  // Filters state
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    business_id: searchParams.get('business_id') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    search: searchParams.get('search') || '',
    is_active: 'true'
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10
  });

  useEffect(() => {
    if (user?.role === 'client') {
      fetchServices();
    } else {
      setLoading(false);
    }
  }, [user, filters, pagination.current_page]);

  const fetchServices = async () => {
    try {
      setLoading(true);

      // Construct query parameters
      const params = new URLSearchParams({
        page: (pagination.current_page || 1).toString(),
        limit: (pagination.items_per_page || 10).toString(),
        is_active: filters.is_active
      });

      if (filters.category) params.append('category', filters.category);
      if (filters.business_id) params.append('business_id', filters.business_id);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/client/services?${params}`);

      if (response.data.code === 'SUCCESS') {
        setServices(response.data.services || []);
        setPagination(response.data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_items: 0,
          items_per_page: 10
        });
      } else {
        setError(response.data.message || 'Failed to load services');
      }
    } catch (error: any) {
      console.error('Client services error:', error);
      setError(error.response?.data?.message || 'Failed to get services');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, current_page: 1 })); // Reset to first page
  };

  const handleBookService = (serviceId: number, businessId: number) => {
    navigate(`/appointment-booking?service=${serviceId}&business=${businessId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'client') {
    return <Navigate to="/login" replace />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Error Loading Services</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchServices}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Available Services</h1>
        <p className="mt-1 text-sm text-gray-500">Browse services offered by verified businesses</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              <option value="hair">Hair Services</option>
              <option value="nails">Nail Services</option>
              <option value="spa">Spa Services</option>
              <option value="beauty">Beauty Treatments</option>
              <option value="massage">Massage Therapy</option>
            </select>
          </div>
          <div>
            <label htmlFor="business_id" className="block text-sm font-medium text-gray-700 mb-1">
              Business
            </label>
            <select
              id="business_id"
              name="business_id"
              value={filters.business_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Businesses</option>
              {/* Would be populated with verified businesses */}
            </select>
          </div>
          <div>
            <label htmlFor="min_price" className="block text-sm font-medium text-gray-700 mb-1">
              Min Price
            </label>
            <input
              type="number"
              id="min_price"
              name="min_price"
              value={filters.min_price}
              onChange={handleFilterChange}
              placeholder="Min"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="max_price" className="block text-sm font-medium text-gray-700 mb-1">
              Max Price
            </label>
            <input
              type="number"
              id="max_price"
              name="max_price"
              value={filters.max_price}
              onChange={handleFilterChange}
              placeholder="Max"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
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
              placeholder="Search services..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </form>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Services Grid */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.id} className="bg-white shadow overflow-hidden rounded-lg">
              <div className="h-48 bg-gray-200">
                {service.image ? (
                  <img
                    className="h-full w-full object-cover"
                    src={service.image}
                    alt={service.name}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{service.business_name}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${service.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {service.description || 'No description available for this service.'}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-900 font-medium">
                    ${Number(service.price).toFixed(2)} • {service.duration} min
                  </div>
                  <button
                    onClick={() => handleBookService(service.id, service.business_id)}
                    disabled={!service.is_active}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${service.is_active
                      ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      : 'bg-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {service.is_active ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.category || filters.search ? 'No services match your search criteria.' : 'No services are currently available.'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setFilters({
                    category: '',
                    business_id: '',
                    min_price: '',
                    max_price: '',
                    search: '',
                    is_active: 'true'
                  });
                  setPagination(prev => ({ ...prev, current_page: 1 }));
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
          <div className="flex-1 flex">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(pagination.current_page - 1) * pagination.items_per_page + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)}
              </span> of{' '}
              <span className="font-medium">{pagination.total_items}</span> results
            </div>
          </div>
          <div className="flex">
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
        </div>
      )}
    </div>
  );
};

export default ClientServicesPage;
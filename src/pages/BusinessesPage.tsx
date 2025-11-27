import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/ApiService';
import FavoriteButton from '../components/FavoriteButton';

interface Business {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  logo: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  theme_mode: string;
  business_hours: any;
  special_hours: any;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

const BusinessesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVerifiedBusinesses();
  }, []);

  const fetchVerifiedBusinesses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/businesses/verified');
      setBusinesses(response.data.businesses || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (business.description && business.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (business.city && business.city.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch && business.is_active && business.is_verified;
  });



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user && user.role !== 'client') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Business Directory</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>This section is designed for clients. You are currently logged in as a {user.role}.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Available Businesses</h1>
        <p className="mt-1 text-sm text-gray-500">Browse verified businesses and book your appointments</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search businesses by name, city, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Business Grid */}
      {filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBusinesses.map((business) => (
            <div
              key={business.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {business.logo ? (
                      <img
                        src={business.logo}
                        alt={business.name}
                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Logo</span>
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{business.name}</h3>
                      <p className="text-sm text-gray-500">{business.city}, {business.state}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <FavoriteButton businessId={business.id} size="md" />
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {business.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => navigate(`/businesses/${business.id}`)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => navigate(`/businesses/${business.id}/book`)}
                    className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No businesses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'No businesses match your search. Try different keywords.' : 'No verified businesses are currently available.'}
          </p>
          {searchTerm && (
            <div className="mt-6">
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}


    </div>
  );
};

export default BusinessesPage;
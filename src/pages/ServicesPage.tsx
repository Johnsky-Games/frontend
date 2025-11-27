import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface Service {
  id: number;
  business_id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  image: string | null;
  is_active: boolean;
  created_at: string;
}

const ServicesPage: React.FC = () => {
  const { user, business } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    category: 'Hair',
    image: null as string | null
  });

  useEffect(() => {
    // In a real app, you would fetch services from the backend
    // For now, let's simulate with mock data
    const mockServices: Service[] = [
      {
        id: 1,
        business_id: 1,
        name: 'Haircut & Style',
        description: 'Professional haircut and styling for any occasion',
        duration: 45,
        price: 45.00,
        category: 'Hair',
        image: null,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        business_id: 1,
        name: 'Beard Trim',
        description: 'Professional beard trimming and shaping',
        duration: 30,
        price: 25.00,
        category: 'Beard',
        image: null,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        business_id: 1,
        name: 'Manicure',
        description: 'Basic manicure with nail shaping and polish',
        duration: 30,
        price: 30.00,
        category: 'Nails',
        image: null,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];
    
    setTimeout(() => {
      setServices(mockServices);
      setLoading(false);
    }, 500);
  }, []);

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    
    const service: Service = {
      id: services.length + 1,
      business_id: business?.id || 1,
      name: newService.name,
      description: newService.description,
      duration: newService.duration,
      price: newService.price,
      category: newService.category,
      image: newService.image,
      is_active: true,
      created_at: new Date().toISOString()
    };
    
    setServices([...services, service]);
    setNewService({
      name: '',
      description: '',
      duration: 30,
      price: 0,
      category: 'Hair',
      image: null
    });
    setShowAddForm(false);
    toast.success('Service added successfully!');
  };

  const handleDeleteService = (id: number) => {
    setServices(services.filter(service => service.id !== id));
    toast.success('Service deleted successfully!');
  };

  const handleToggleService = (id: number) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, is_active: !service.is_active } : service
    ));
    toast.success(`Service ${services.find(s => s.id === id)?.is_active ? 'deactivated' : 'activated'} successfully!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Access Denied</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Please sign in to manage services.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Service
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Service</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={handleAddService}>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Service Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={newService.description}
                    onChange={(e) => setNewService({...newService, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    id="duration"
                    value={newService.duration}
                    onChange={(e) => setNewService({...newService, duration: parseInt(e.target.value)})}
                    min="1"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value)})}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={newService.category}
                    onChange={(e) => setNewService({...newService, category: e.target.value})}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="Hair">Hair</option>
                    <option value="Beard">Beard</option>
                    <option value="Nails">Nails</option>
                    <option value="Skin">Skin Care</option>
                    <option value="Massage">Massage</option>
                    <option value="Waxing">Waxing</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
                >
                  Add Service
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {services.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">No services yet</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Get started by adding your first service.</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{service.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{service.category}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleService(service.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {service.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-500 mb-4">{service.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">${service.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{service.duration} minutes</p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
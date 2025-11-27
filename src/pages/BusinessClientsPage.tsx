import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/ApiService';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

interface Appointment {
  id: number;
  client_id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_id: number;
  service_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  created_at: string;
}

const BusinessClientsPage: React.FC = () => {
  const { business, user } = useAuth();
  const [clients, setClients] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'clients' | 'appointments'>('clients');
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [clientAppointments, setClientAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (user?.role === 'business_owner' && business) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, business]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get all appointments for this business
      const appointmentsResponse = await api.get(`/appointments/business/${business?.id}`);
      setAppointments(appointmentsResponse.data.appointments || []);
      
      // Extract unique clients from appointments
      const uniqueClientIds = Array.from(new Set(appointmentsResponse.data.appointments.map((appt: any) => appt.client_id)));
      const uniqueClients = [];

      for (const clientId of uniqueClientIds) {
        const clientResponse = await api.get(`/users/${clientId}`);
        uniqueClients.push(clientResponse.data.user);
      }
      
      setClients(uniqueClients);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getClientAppointments = (clientId: number) => {
    return appointments.filter(appt => appt.client_id === clientId);
  };

  const handleViewClientDetails = (client: User) => {
    setSelectedClient(client);
    setClientAppointments(getClientAppointments(client.id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'business_owner') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Access Denied</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Only business owners can access this page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Your Clients & Appointments</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your clients and their appointments</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('clients')}
            className={`${
              activeTab === 'clients'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Clients
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`${
              activeTab === 'appointments'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Appointments
          </button>
        </nav>
      </div>

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {clients.length > 0 ? (
              clients.map((client) => (
                <li key={client.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-indigo-600">
                            {client.name}
                          </div>
                          <div className="text-sm text-gray-500">{client.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">
                          {client.phone || 'No phone provided'}
                        </div>
                        <button
                          onClick={() => handleViewClientDetails(client)}
                          className="ml-4 px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          View Appointments
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm text-gray-500">
                        Client since: {formatDate(client.created_at)}
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li>
                <div className="text-center px-4 py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
                  <p className="mt-1 text-sm text-gray-500">You don't have any clients with appointments yet.</p>
                </div>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <li key={appointment.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                          {appointment.client_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-indigo-600">
                            {appointment.client_name}
                          </div>
                          <div className="text-sm text-gray-500">{appointment.service_name}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">
                          {formatDate(appointment.date)} at {formatTime(appointment.start_time)}
                        </div>
                        <span className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          appointment.status === 'no_show' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <div className="text-sm text-gray-500">
                        {appointment.client_email} {appointment.client_phone && `• ${appointment.client_phone}`}
                      </div>
                      <button className="inline-flex items-center px-2.5 py-0.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                        Contact
                      </button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li>
                <div className="text-center px-4 py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
                  <p className="mt-1 text-sm text-gray-500">You don't have any appointments scheduled.</p>
                </div>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Client Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Client Details: {selectedClient.name}
                </h3>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4">
                <div className="grid grid-cols-1 gap-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Personal Information</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedClient.name}</p>
                    <p className="text-sm text-gray-500">{selectedClient.email}</p>
                    {selectedClient.phone && (
                      <p className="text-sm text-gray-500">{selectedClient.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Client Since</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedClient.created_at)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Appointment History</h4>
                    <div className="mt-2 space-y-2">
                      {clientAppointments.length > 0 ? (
                        clientAppointments.map((appt) => (
                          <div key={appt.id} className="border border-gray-200 rounded-md p-3">
                            <div className="flex justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{appt.service_name}</p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(appt.date)} • {formatTime(appt.start_time)} - {formatTime(appt.end_time)}
                                </p>
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                appt.status === 'completed' ? 'bg-green-100 text-green-800' :
                                appt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                appt.status === 'no_show' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                              </span>
                            </div>
                            {appt.notes && (
                              <p className="mt-2 text-sm text-gray-500">Notes: {appt.notes}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No appointments found for this client.</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Contact Client
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessClientsPage;
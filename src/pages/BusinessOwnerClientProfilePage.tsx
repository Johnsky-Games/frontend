import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/ApiService';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  email_verified: boolean;
  created_at: string;
  total_appointments: number;
  last_appointment_date: string | null;
}

interface Appointment {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  service_name: string;
  total_price: number;
}

const BusinessOwnerClientProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (user?.role === 'business_owner' && id) {
      fetchClientData();
    }
  }, [user, id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);

      // Fetch client info from clients list
      const clientsResponse = await api.get('/business-owner/clients');
      const clientData = clientsResponse.data.clients.find((c: Client) => c.id === parseInt(id!));

      if (!clientData) {
        toast.error('Client not found');
        navigate('/business-owner/clients');
        return;
      }

      setClient(clientData);

      // Fetch appointments for this client
      const appointmentsResponse = await api.get('/business-owner/appointments', {
        params: { client_id: id, limit: 100 }
      });

      const clientAppointments = appointmentsResponse.data.appointments || [];
      setAppointments(clientAppointments);

      // Calculate total spent
      const total = clientAppointments.reduce((sum: number, apt: Appointment) =>
        sum + (Number(apt.total_price) || 0), 0
      );
      setTotalSpent(total);

    } catch (error: any) {
      console.error('Fetch client data error:', error);
      toast.error('Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    navigate(`/business-owner/clients/${id}/message`);
  };

  // TODO: Implement appointment scheduling page for business owners
  // const handleScheduleAppointment = () => {
  //   navigate(`/business-owner/appointments/new?client=${id}`);
  // };

  if (!user || user.role !== 'business_owner') {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Client not found</p>
          <button
            onClick={() => navigate('/business-owner/clients')}
            className="mt-4 text-indigo-600 hover:text-indigo-500"
          >
            ← Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/business-owner/clients')}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          ← Back to Clients
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Client Profile</h1>
      </div>

      {/* Client Info Card */}
      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {client.avatar ? (
                <img className="h-20 w-20 rounded-full" src={client.avatar} alt={client.name} />
              ) : (
                <div className="bg-indigo-100 rounded-full h-20 w-20 flex items-center justify-center">
                  <span className="text-indigo-800 font-medium text-2xl">
                    {client.name ? client.name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
              )}
            </div>

            {/* Client Details */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{client.name}</h2>
              <p className="text-sm text-gray-500">{client.email}</p>
              {client.phone && <p className="text-sm text-gray-500">{client.phone}</p>}
              <div className="mt-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${client.email_verified
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {client.email_verified ? '✓ Email Verified' : 'Email Not Verified'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleSendMessage}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send Message
              </button>
              {/* TODO: Add Schedule Appointment button when page is created */}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Appointments</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{client.total_appointments || 0}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Spent</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">${totalSpent.toFixed(2)}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Last Visit</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {client.last_appointment_date
                ? new Date(client.last_appointment_date).toLocaleDateString()
                : 'Never'}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Member Since</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {new Date(client.created_at).toLocaleDateString()}
            </dd>
          </div>
        </div>
      </div>

      {/* Appointment History */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Appointment History</h3>
          {appointments.length > 0 ? (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Time</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Service</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {new Date(appointment.date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {appointment.start_time && appointment.end_time
                          ? `${appointment.start_time.substring(0, 5)} - ${appointment.end_time.substring(0, 5)}`
                          : 'N/A'
                        }
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {appointment.service_name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        ${Number(appointment.total_price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No appointments found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessOwnerClientProfilePage;
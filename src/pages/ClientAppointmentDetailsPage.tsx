import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/ApiService';
import { Calendar, Clock, MapPin, DollarSign, User, FileText, Phone, Mail, ArrowLeft } from 'lucide-react';

interface AppointmentDetails {
    id: number;
    business_id: number;
    business_name: string;
    business_address?: string;
    business_phone?: string;
    business_email?: string;
    service_id: number;
    service_name: string;
    service_duration?: number;
    staff_member_id: number;
    staff_member_name?: string;
    date: string;
    start_time: string;
    end_time: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    notes: string | null;
    total_price: number;
    created_at: string;
}

const ClientAppointmentDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.role === 'client' && id) {
            fetchAppointmentDetails();
        } else {
            setLoading(false);
        }
    }, [user, id]);

    const fetchAppointmentDetails = async () => {
        try {
            setLoading(true);
            // Note: We might need to update the backend to return full details if the list endpoint doesn't
            // For now, assuming we can fetch by ID
            const response = await api.get(`/client/appointments/${id}`);

            if (response.data.code === 'SUCCESS') {
                setAppointment(response.data.appointment);
            } else {
                setError(response.data.message || 'Failed to load appointment details');
            }
        } catch (error: any) {
            console.error('Appointment details error:', error);
            setError(error.response?.data?.message || 'Failed to get appointment details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async () => {
        if (!appointment) return;

        if (!window.confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            const response = await api.put(`/client/appointments/${appointment.id}/cancel`);

            if (response.data.code === 'SUCCESS') {
                setAppointment(prev => prev ? { ...prev, status: 'cancelled' } : null);
                toast.success('Appointment cancelled successfully');
            } else {
                toast.error(response.data.message || 'Failed to cancel appointment');
            }
        } catch (error: any) {
            console.error('Cancel appointment error:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel appointment');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user || user.role !== 'client') {
        // Redirect handled by protected route usually, but safe to have
        return null;
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Error</h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                            <p>{error}</p>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={() => navigate('/client/appointments')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                            >
                                Back to Appointments
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8">
                <div className="text-center">
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white">Appointment not found</h2>
                    <button
                        onClick={() => navigate('/client/appointments')}
                        className="mt-4 text-primary-600 hover:text-primary-500"
                    >
                        Back to Appointments
                    </button>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-800 dark:text-secondary-200';
            case 'confirmed': return 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-800 dark:text-secondary-200';
            case 'completed': return 'bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-200';
            case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
            case 'no_show': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            <div className="mb-6 flex items-center">
                <button
                    onClick={() => navigate('/client/appointments')}
                    className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Appointment Details</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            {appointment.service_name}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                            Reference ID: #{appointment.id}
                        </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                                <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                                Date & Time
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                                {new Date(appointment.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                                <br />
                                {appointment.start_time} - {appointment.end_time}
                            </dd>
                        </div>

                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                                <MapPin className="mr-2 h-5 w-5 text-gray-400" />
                                Business
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                                <div className="font-medium">{appointment.business_name}</div>
                                {appointment.business_address && (
                                    <div className="text-gray-500 dark:text-gray-400">{appointment.business_address}</div>
                                )}
                                <div className="mt-1 flex gap-4">
                                    {appointment.business_phone && (
                                        <a href={`tel:${appointment.business_phone}`} className="text-primary-600 hover:text-primary-500 flex items-center text-xs">
                                            <Phone size={14} className="mr-1" /> Call
                                        </a>
                                    )}
                                    <button
                                        onClick={() => navigate(`/businesses/${appointment.business_id}`)}
                                        className="text-primary-600 hover:text-primary-500 flex items-center text-xs"
                                    >
                                        View Profile
                                    </button>
                                </div>
                            </dd>
                        </div>

                        {appointment.staff_member_name && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                                    <User className="mr-2 h-5 w-5 text-gray-400" />
                                    Staff Member
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                                            {appointment.staff_member_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-3">
                                            <div className="font-medium">{appointment.staff_member_name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Your service provider</div>
                                        </div>
                                    </div>
                                </dd>
                            </div>
                        )}

                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                                <DollarSign className="mr-2 h-5 w-5 text-gray-400" />
                                Price
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                                ${Number(appointment.total_price).toFixed(2)}
                            </dd>
                        </div>

                        {appointment.staff_member_name && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                                    <User className="mr-2 h-5 w-5 text-gray-400" />
                                    Staff Member
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                                    {appointment.staff_member_name}
                                </dd>
                            </div>
                        )}

                        {appointment.notes && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                                    <FileText className="mr-2 h-5 w-5 text-gray-400" />
                                    Notes
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                                    {appointment.notes}
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>

                {appointment.status === 'scheduled' && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6 flex justify-end">
                        <button
                            onClick={handleCancelAppointment}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Cancel Appointment
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientAppointmentDetailsPage;

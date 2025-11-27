import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/ApiService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, TrendingUp, DollarSign, Award, Star, Activity, Zap, ArrowRight } from 'lucide-react';

interface Appointment {
    id: number;
    client_id: number;
    client_name: string;
    service_id: number;
    service_name: string;
    duration: number;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    notes: string;
    total_price: string;
}

const StaffAppointmentsPage: React.FC = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all'); // all, scheduled, completed, cancelled

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/staff/appointments');
            setAppointments(response.data.appointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (appointmentId: number, newStatus: string) => {
        try {
            await api.patch(`/staff/appointments/${appointmentId}/status`, { status: newStatus });
            toast.success('Estado de la cita actualizado');
            fetchAppointments(); // Refresh list
        } catch (error) {
            console.error('Error updating appointment status:', error);
            toast.error('No se pudo actualizar el estado de la cita');
        }
    };

    const formatTime = (time: string) => {
        return time.substring(0, 5);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'scheduled':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Completada';
            case 'cancelled':
                return 'Cancelada';
            case 'scheduled':
                return 'Programada';
            default:
                return status;
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        if (filter === 'all') return true;
        return apt.status === filter;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mis Citas</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Gestiona tu calendario de citas
                    </p>
                </div>
                <Link
                    to="/staff/dashboard"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    ← Volver al Dashboard
                </Link>
            </div>

            {/* Filters */}
            <div className="mb-6 flex space-x-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    Todas ({appointments.length})
                </button>
                <button
                    onClick={() => setFilter('scheduled')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'scheduled'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    Programadas ({appointments.filter(a => a.status === 'scheduled').length})
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'completed'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    Completadas ({appointments.filter(a => a.status === 'completed').length})
                </button>
                <button
                    onClick={() => setFilter('cancelled')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'cancelled'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    Canceladas ({appointments.filter(a => a.status === 'cancelled').length})
                </button>
            </div>

            {/* Appointments List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {filteredAppointments.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {filteredAppointments.map((appointment) => (
                            <li key={appointment.id} className="hover:bg-gray-50 transition">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4 flex-1">
                                            {/* Avatar */}
                                            <div className="flex-shrink-0">
                                                <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                                                    {appointment.client_name?.charAt(0) || 'C'}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {appointment.client_name || `Cliente #${appointment.client_id}`}
                                                    </p>
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                                        {getStatusLabel(appointment.status)}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {appointment.service_name || `Servicio #${appointment.service_id}`}
                                                </p>
                                                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {formatDate(appointment.date)}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                                                    </div>
                                                    {appointment.duration && (
                                                        <div className="flex items-center">
                                                            <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                            {appointment.duration} min
                                                        </div>
                                                    )}
                                                </div>
                                                {appointment.notes && (
                                                    <p className="mt-2 text-sm text-gray-500 italic">
                                                        Notas: {appointment.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Price */}
                                        {appointment.total_price && (
                                            <div className="ml-4 flex-shrink-0 text-right">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    ${appointment.total_price}
                                                </p>
                                                {appointment.status === 'scheduled' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                                                        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm"
                                                    >
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                        Completar
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="px-4 py-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            No se encontraron citas con los filtros seleccionados.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffAppointmentsPage;

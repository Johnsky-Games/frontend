import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/ApiService';

interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: number;
    business_id: number;
    business_name: string;
}

interface Business {
    id: number;
    name: string;
    address: string;
    business_hours: any;
}

interface TimeSlot {
    time: string;
    available: boolean;
}

interface Staff {
    id: number;
    user_name: string;
    job_title: string;
    user_avatar: string | null;
}

const AppointmentBookingPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const serviceId = searchParams.get('service');
    const businessId = searchParams.get('business');

    const [service, setService] = useState<Service | null>(null);
    const [business, setBusiness] = useState<Business | null>(null);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [date, setDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [notes, setNotes] = useState('');
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        if (!serviceId || !businessId) {
            toast.error('Invalid booking link');
            navigate('/client/services');
            return;
        }
        fetchDetails();
    }, [serviceId, businessId]);

    useEffect(() => {
        if (serviceId) {
            fetchStaff();
        }
    }, [serviceId]);

    useEffect(() => {
        if (date && serviceId && businessId) {
            fetchAvailability();
        }
    }, [date, selectedStaff, serviceId, businessId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);

            // Fetch business
            const businessRes = await api.get(`/businesses/${businessId}`);
            if (businessRes.data.code === 'SUCCESS') {
                setBusiness(businessRes.data.data || businessRes.data.business);
            }

            // Fetch service
            const servicesRes = await api.get(`/businesses/${businessId}/services`);
            if (servicesRes.data.code === 'SUCCESS') {
                const foundService = servicesRes.data.services.find((s: any) => s.id === parseInt(serviceId!));
                if (foundService) {
                    setService(foundService);
                } else {
                    toast.error('Service not found');
                }
            }

        } catch (error) {
            console.error('Error fetching details:', error);
            toast.error('Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const response = await api.get(`/businesses/${businessId}/staff`, {
                params: { service_id: serviceId }
            });
            if (response.data.code === 'SUCCESS') {
                setStaff(response.data.staff);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const fetchAvailability = async () => {
        try {
            setLoadingSlots(true);
            setSelectedTime(''); // Reset selection when date or staff changes
            const params: any = { date, service_id: serviceId };
            if (selectedStaff) {
                params.staff_id = selectedStaff;
            }
            const response = await api.get(`/businesses/${businessId}/availability`, {
                params
            });

            if (response.data.code === 'SUCCESS') {
                setAvailableSlots(response.data.slots);
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
            toast.error('Failed to load available times');
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !selectedTime) {
            toast.error('Please select date and time');
            return;
        }

        try {
            setSubmitting(true);

            // Calculate end time based on duration
            const startDate = new Date(`2000-01-01T${selectedTime}:00`);
            const endDate = new Date(startDate.getTime() + (service!.duration * 60000));
            const endTime = endDate.toTimeString().slice(0, 5);

            const payload: any = {
                business_id: parseInt(businessId!),
                service_id: parseInt(serviceId!),
                date,
                start_time: selectedTime,
                end_time: endTime,
                notes
            };

            if (selectedStaff) {
                payload.staff_id = parseInt(selectedStaff);
            }

            const response = await api.post('/appointments', payload);

            if (response.data.code === 'APPOINTMENT_CREATED') {
                toast.success('Appointment booked successfully!');
                navigate('/client/appointments');
            }
        } catch (error: any) {
            console.error('Booking error:', error);
            if (error.response?.data?.code === 'APPOINTMENT_OVERLAP') {
                toast.error('This time slot is no longer available. Please choose another.');
                fetchAvailability(); // Refresh slots
            } else {
                toast.error(error.response?.data?.message || 'Failed to book appointment');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!service || !business) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">Service or Business not found</h2>
                    <button onClick={() => navigate('/client/services')} className="mt-4 text-indigo-600 hover:text-indigo-500">
                        Back to Services
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h1>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{business.name}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-700">
                            <span className="mr-4">⏱ {service.duration} mins</span>
                            <span>💰 ${Number(service.price).toFixed(2)}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Staff Selection */}
                        {staff.length > 0 && (
                            <div>
                                <label htmlFor="staff" className="block text-sm font-medium text-gray-700">
                                    Select Staff Member (Optional)
                                </label>
                                <select
                                    id="staff"
                                    value={selectedStaff}
                                    onChange={(e) => setSelectedStaff(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">Any Available Staff</option>
                                    {staff.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {member.user_name} - {member.job_title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Date Selection */}
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                Select Date
                            </label>
                            <input
                                type="date"
                                id="date"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        {/* Time Slots */}
                        {date && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Available Times
                                </label>
                                {loadingSlots ? (
                                    <div className="text-sm text-gray-500">Loading available times...</div>
                                ) : availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                                        {availableSlots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                type="button"
                                                disabled={!slot.available}
                                                onClick={() => setSelectedTime(slot.time)}
                                                className={`
                                                    px-2 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                                                    ${!slot.available
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : selectedTime === slot.time
                                                            ? 'bg-indigo-600 text-white shadow-sm'
                                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                    }
                                                `}
                                            >
                                                {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500 italic">
                                        No available times for this date.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                Notes (Optional)
                            </label>
                            <textarea
                                id="notes"
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Any special requests?"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => navigate('/client/services')}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !selectedTime}
                                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${(submitting || !selectedTime) ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                            >
                                {submitting ? 'Booking...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AppointmentBookingPage;

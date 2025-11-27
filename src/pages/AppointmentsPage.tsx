import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import useFormValidation from '../hooks/useFormValidation';
import Input from '../components/Input';

interface Appointment {
  id: number;
  business_id: number;
  client_id: number;
  staff_id: number | null;
  service_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

interface NewAppointmentForm {
  service_id: number;
  date: string;
  start_time: string;
  end_time: string;
  notes: string;
}

const AppointmentsPage: React.FC = () => {
  const { user, business } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);

  const appointmentValidation = useFormValidation<NewAppointmentForm>(
    {
      service_id: 1,
      date: new Date().toISOString().split('T')[0],
      start_time: '10:00',
      end_time: '11:00',
      notes: ''
    },
    {
      date: [
        { required: true, message: 'Date is required' }
      ],
      start_time: [
        { required: true, message: 'Start time is required' }
      ],
      end_time: [
        { required: true, message: 'End time is required' }
      ]
    }
  );

  // Destructure the validation hook
  const { values, errors, isValid, isFieldValid, isFieldFilled, handleChange, handleBlur } = appointmentValidation;

  // Custom validation for end time to ensure it's after start time
  const [timeError, setTimeError] = useState('');

  // Function to validate time constraints
  const validateTimeConstraints = (start: string, end: string) => {
    if (start && end) {
      const startDate = new Date(`2000-01-01T${start}`);
      const endDate = new Date(`2000-01-01T${end}`);

      if (endDate <= startDate) {
        return 'End time must be after start time';
      }
    }
    return '';
  };

  // Enhanced handleChange to handle time validation
  const handleTimeChange = (field: keyof NewAppointmentForm, value: string) => {
    handleChange(field, value);

    // Validate time constraints when both times have been set
    if (field === 'start_time' || field === 'end_time') {
      const start = field === 'start_time' ? value : values.start_time;
      const end = field === 'end_time' ? value : values.end_time;
      const error = validateTimeConstraints(start, end);
      setTimeError(error);
    }
  };

  // Combined validation status
  const isFormValid = isValid && !timeError;

  useEffect(() => {
    // In a real app, you would fetch appointments from the backend
    // For now, let's simulate with mock data
    const mockAppointments: Appointment[] = [
      {
        id: 1,
        business_id: 1,
        client_id: 1,
        staff_id: 1,
        service_id: 1,
        date: new Date().toISOString().split('T')[0],
        start_time: '10:00:00',
        end_time: '11:00:00',
        status: 'confirmed',
        notes: 'Regular haircut',
        total_amount: 45.00,
        payment_status: 'paid',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        business_id: 1,
        client_id: 2,
        staff_id: 2,
        service_id: 2,
        date: new Date().toISOString().split('T')[0],
        start_time: '14:00:00',
        end_time: '14:30:00',
        status: 'scheduled',
        notes: 'Beard trim',
        total_amount: 25.00,
        payment_status: 'pending',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        business_id: 1,
        client_id: 3,
        staff_id: 1,
        service_id: 3,
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        start_time: '11:00:00',
        end_time: '11:30:00',
        status: 'scheduled',
        notes: 'Nail care',
        total_amount: 30.00,
        payment_status: 'pending',
        created_at: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      setAppointments(mockAppointments);
      setLoading(false);
    }, 500);
  }, []);

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();

    // Check all validation - only validate time constraints if both times are filled
    let timeConstraintError = '';
    if (isFieldFilled('start_time') && isFieldFilled('end_time')) {
      timeConstraintError = validateTimeConstraints(values.start_time, values.end_time);
    }

    if (!isValid || timeConstraintError) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // In a real app, you would send this to the backend
    const appointment: Appointment = {
      id: appointments.length + 1,
      business_id: business?.id || 1,
      client_id: user?.id || 1,
      staff_id: 1, // Default staff
      service_id: values.service_id,
      date: values.date,
      start_time: values.start_time + ':00',
      end_time: values.end_time + ':00',
      status: 'scheduled',
      notes: values.notes,
      total_amount: 45.00, // This would be calculated based on service
      payment_status: 'pending',
      created_at: new Date().toISOString()
    };

    setAppointments([...appointments, appointment]);
    // Reset form values after successful submission
    handleChange('service_id', 1);
    handleChange('date', new Date().toISOString().split('T')[0]);
    handleChange('start_time', '10:00');
    handleChange('end_time', '11:00');
    handleChange('notes', '');
    setShowAddForm(false);
    toast.success('Appointment booked successfully!');
  };

  const handleCancelAppointment = (id: number) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: 'cancelled' } : apt
    ));
    toast.success('Appointment cancelled successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
              <p>Please sign in to view appointments.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Appointments</h1>
        <div className="flex space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="block w-full min-w-0 flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Book Appointment
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Book New Appointment</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={handleAddAppointment}>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700">
                    Select Service
                  </label>
                  <select
                    id="service"
                    name="service_id"
                    value={values.service_id}
                    onChange={(e) => handleChange('service_id', parseInt(e.target.value))}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="1">Haircut & Style - $45.00</option>
                    <option value="2">Beard Trim - $25.00</option>
                    <option value="3">Manicure - $30.00</option>
                    <option value="4">Hair Coloring - $80.00</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Input
                    label="Date"
                    id="date"
                    name="date"
                    type="date"
                    value={values.date}
                    onChange={(e) => {
                      handleChange('date', e.target.value);
                    }}
                    onBlur={() => handleBlur('date')}
                    min={new Date().toISOString().split('T')[0]}
                    error={errors.date}
                    isValid={isFieldValid('date') && isFieldFilled('date')}
                    helperText={errors.date ? errors.date : 'Select appointment date'}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Input
                    label="Start Time"
                    id="start_time"
                    name="start_time"
                    type="time"
                    value={values.start_time}
                    onChange={(e) => handleTimeChange('start_time', e.target.value)}
                    onBlur={() => handleBlur('start_time')}
                    error={errors.start_time || (isFieldFilled('start_time') && isFieldFilled('end_time') ? timeError : '')}
                    isValid={isFieldValid('start_time') && (!timeError || !isFieldFilled('end_time'))}
                    helperText={errors.start_time ? errors.start_time :
                               timeError && isFieldFilled('start_time') && isFieldFilled('end_time') ? timeError :
                               'Select start time'}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Input
                    label="End Time"
                    id="end_time"
                    name="end_time"
                    type="time"
                    value={values.end_time}
                    onChange={(e) => handleTimeChange('end_time', e.target.value)}
                    onBlur={() => handleBlur('end_time')}
                    error={errors.end_time || (isFieldFilled('start_time') && isFieldFilled('end_time') ? timeError : '')}
                    isValid={isFieldValid('end_time') && (!timeError || !isFieldFilled('start_time'))}
                    helperText={errors.end_time ? errors.end_time :
                               timeError && isFieldFilled('start_time') && isFieldFilled('end_time') ? timeError :
                               'Select end time after start time'}
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={values.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
                >
                  Book Appointment
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

      {appointments.filter(apt => apt.date === selectedDate).length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">No appointments for this date</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>There are no appointments scheduled for {selectedDate}.</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Book New Appointment
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {appointments
              .filter(apt => apt.date === selectedDate)
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((appointment) => (
                <li key={appointment.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-indigo-600 truncate">
                          Client #{appointment.client_id}
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        ${appointment.total_amount.toFixed(2)}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="mr-4">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(`${appointment.date}T${appointment.start_time}`).toLocaleDateString()} 
                            <span className="ml-4">
                              {new Date(`${appointment.date}T${appointment.start_time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                              {new Date(`${appointment.date}T${appointment.end_time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Service #{appointment.service_id}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span className="capitalize">{appointment.payment_status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Notes: {appointment.notes}</p>
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Cancel
                        </button>
                      )}
                      {appointment.status === 'scheduled' && (
                        <button className="ml-2 inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Confirm
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/ApiService';

interface Client {
    id: number;
    name: string;
    email: string;
}

const BusinessOwnerClientMessagePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [client, setClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    });

    useEffect(() => {
        if (user?.role === 'business_owner' && id) {
            fetchClient();
        }
    }, [user, id]);

    const fetchClient = async () => {
        try {
            setLoading(true);
            const response = await api.get('/business-owner/clients');
            const clientData = response.data.clients.find((c: Client) => c.id === parseInt(id!));

            if (!clientData) {
                toast.error('Client not found');
                navigate('/business-owner/clients');
                return;
            }

            setClient(clientData);
        } catch (error: any) {
            console.error('Fetch client error:', error);
            toast.error('Failed to load client data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.subject || !formData.message) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            setSending(true);

            // For now, just show success message
            // In the future, implement actual email/notification sending
            toast.success(`Message sent to ${client?.name}!`);

            // Navigate back to client profile
            navigate(`/business-owner/clients/${id}`);

        } catch (error: any) {
            console.error('Send message error:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(`/business-owner/clients/${id}`)}
                    className="text-sm text-gray-500 hover:text-gray-700 mb-2"
                >
                    ← Back to Profile
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">Send Message to {client.name}</h1>
                <p className="mt-1 text-sm text-gray-500">{client.email}</p>
            </div>

            {/* Message Form */}
            <div className="bg-white shadow sm:rounded-lg">
                <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
                    <div className="space-y-6">
                        {/* Subject */}
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="e.g., Appointment Reminder"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={8}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Type your message here..."
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                This message will be sent to {client.email}
                            </p>
                        </div>

                        {/* Info Box */}
                        <div className="rounded-md bg-blue-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm text-blue-700">
                                        <strong>Note:</strong> This is a demo feature. In production, this would send an actual email or in-app notification to the client.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/business-owner/clients/${id}`)}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={sending}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BusinessOwnerClientMessagePage;

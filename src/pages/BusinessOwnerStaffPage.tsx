import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/ApiService';
import { User, Plus, Edit2, Trash2, Power, Briefcase, X } from 'lucide-react';

interface Staff {
    id: number;
    business_id: number;
    user_id: number;
    job_title: string;
    bio: string | null;
    services: number[];
    is_available: boolean;
    user_name: string;
    user_email: string;
    user_avatar: string | null;
}

interface Service {
    id: number;
    name: string;
    duration: number;
    price: number;
}

const BusinessOwnerStaffPage: React.FC = () => {
    const { business } = useAuth();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        phone: '',
        job_title: '',
        bio: '',
        services: [] as number[]
    });

    useEffect(() => {
        fetchStaff();
        fetchServices();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await api.get('/business-owner/staff');
            if (response.data.code === 'SUCCESS') {
                setStaff(response.data.staff);
            }
        } catch (error: any) {
            console.error('Fetch staff error:', error);
            toast.error('Failed to load staff members');
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await api.get(`/businesses/${business?.id}/services`);
            if (response.data.code === 'SUCCESS') {
                setServices(response.data.services);
            }
        } catch (error) {
            console.error('Fetch services error:', error);
        }
    };

    const handleOpenModal = (staffMember?: Staff) => {
        if (staffMember) {
            setEditingStaff(staffMember);
            setFormData({
                email: staffMember.user_email,
                name: staffMember.user_name,
                phone: '',
                job_title: staffMember.job_title,
                bio: staffMember.bio || '',
                services: staffMember.services || []
            });
        } else {
            setEditingStaff(null);
            setFormData({
                email: '',
                name: '',
                phone: '',
                job_title: '',
                bio: '',
                services: []
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingStaff(null);
        setFormData({
            email: '',
            name: '',
            phone: '',
            job_title: '',
            bio: '',
            services: []
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.job_title) {
            toast.error('Job title is required');
            return;
        }

        if (!formData.email) {
            toast.error('Email is required');
            return;
        }

        if (!editingStaff && !formData.name) {
            toast.error('Name is required for new staff members');
            return;
        }

        try {
            const payload: any = {
                email: formData.email,
                job_title: formData.job_title,
                bio: formData.bio || null,
                services: formData.services
            };

            // Only include name and phone for new staff
            if (!editingStaff) {
                payload.name = formData.name;
                if (formData.phone) {
                    payload.phone = formData.phone;
                }
            }

            console.log('📤 Sending staff payload:', payload);

            if (editingStaff) {
                const response = await api.put(`/business-owner/staff/${editingStaff.id}`, payload);
                if (response.data.code === 'SUCCESS') {
                    toast.success('Staff member updated successfully');
                    fetchStaff();
                    handleCloseModal();
                }
            } else {
                const response = await api.post('/business-owner/staff', payload);
                if (response.data.code === 'STAFF_CREATED') {
                    toast.success('Staff member created successfully');
                    fetchStaff();
                    handleCloseModal();
                }
            }
        } catch (error: any) {
            console.error('Submit staff error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save staff member';
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (staffId: number) => {
        if (!window.confirm('Are you sure you want to delete this staff member?')) {
            return;
        }

        try {
            const response = await api.delete(`/business-owner/staff/${staffId}`);
            if (response.data.code === 'SUCCESS') {
                toast.success('Staff member deleted successfully');
                fetchStaff();
            }
        } catch (error: any) {
            console.error('Delete staff error:', error);
            toast.error('Failed to delete staff member');
        }
    };

    const handleToggleAvailability = async (staffId: number) => {
        try {
            const response = await api.patch(`/business-owner/staff/${staffId}/toggle-availability`);
            if (response.data.code === 'SUCCESS') {
                toast.success(response.data.message);
                fetchStaff();
            }
        } catch (error: any) {
            console.error('Toggle availability error:', error);
            toast.error('Failed to update availability');
        }
    };

    const handleServiceToggle = (serviceId: number) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(serviceId)
                ? prev.services.filter(id => id !== serviceId)
                : [...prev.services, serviceId]
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your team members and their services</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Staff Member
                </button>
            </div>

            {/* Staff Grid */}
            {staff.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first team member.</p>
                    <div className="mt-6">
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Add Staff Member
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {staff.map((member) => (
                        <div key={member.id} className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        {member.user_avatar ? (
                                            <img
                                                className="h-12 w-12 rounded-full"
                                                src={`${process.env.REACT_APP_API_URL}/${member.user_avatar}`}
                                                alt={member.user_name}
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                                                <User className="h-6 w-6 text-primary-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">{member.user_name}</h3>
                                        <p className="text-sm text-gray-500">{member.job_title}</p>
                                    </div>
                                    <div className="ml-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {member.is_available ? 'Available' : 'Unavailable'}
                                        </span>
                                    </div>
                                </div>

                                {member.bio && (
                                    <p className="mt-4 text-sm text-gray-600 line-clamp-2">{member.bio}</p>
                                )}

                                {/* Services */}
                                <div className="mt-4">
                                    <p className="text-xs font-medium text-gray-500 mb-2">Services:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {member.services && member.services.length > 0 ? (
                                            member.services.map(serviceId => {
                                                const service = services.find(s => s.id === serviceId);
                                                return service ? (
                                                    <span key={serviceId} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700">
                                                        {service.name}
                                                    </span>
                                                ) : null;
                                            })
                                        ) : (
                                            <span className="text-xs text-gray-400">No services assigned</span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(member)}
                                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <Edit2 className="h-4 w-4 mr-1" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleToggleAvailability(member.id)}
                                        className={`flex-1 inline-flex justify-center items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-md ${member.is_available
                                            ? 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                                            : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                                            }`}
                                    >
                                        <Power className="h-4 w-4 mr-1" />
                                        {member.is_available ? 'Disable' : 'Enable'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member.id)}
                                        className="inline-flex justify-center items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
                                        </h3>
                                        <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Email (always shown) */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                                required
                                                disabled={!!editingStaff}
                                            />
                                            {!editingStaff && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    If this email exists, we'll add them as staff. Otherwise, we'll create a new account.
                                                </p>
                                            )}
                                        </div>

                                        {/* Name (only for new staff) */}
                                        {!editingStaff && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="e.g., John Doe"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                                    required
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Required if creating a new user
                                                </p>
                                            </div>
                                        )}

                                        {/* Phone (optional, only for new staff) */}
                                        {!editingStaff && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Phone (Optional)
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="+1234567890"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>
                                        )}

                                        {/* Job Title */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Job Title *</label>
                                            <input
                                                type="text"
                                                value={formData.job_title}
                                                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                                placeholder="e.g., Senior Stylist, Barber"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                                required
                                            />
                                        </div>

                                        {/* Bio */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Bio</label>
                                            <textarea
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                rows={3}
                                                placeholder="Brief description about this staff member..."
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>

                                        {/* Services */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
                                            <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                                                {services.length === 0 ? (
                                                    <p className="text-sm text-gray-500">No services available</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {services.map(service => (
                                                            <label key={service.id} className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.services.includes(service.id)}
                                                                    onChange={() => handleServiceToggle(service.id)}
                                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-700">{service.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        {editingStaff ? 'Update' : 'Create'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessOwnerStaffPage;

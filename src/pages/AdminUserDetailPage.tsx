import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/ApiService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    avatar: string | null;
    email_verified: boolean;
    status: string;
    created_at: string;
    last_login: string | null;
}

interface Business {
    id: number;
    name: string;
    city: string;
    state: string;
    verification_status: string;
    is_active: boolean;
}

interface Appointment {
    id: number;
    date: string;
    start_time: string;
    status: string;
    service_name?: string; // Assuming backend might join this or we fetch separately, but for now let's see what we get
    business_name?: string;
}

interface UserDetailsResponse {
    user: User;
    relatedData: {
        businesses?: Business[];
        appointments?: Appointment[];
        business?: Business; // For staff
    };
}

const AdminUserDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [userData, setUserData] = useState<User | null>(null);
    const [relatedData, setRelatedData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser?.role === 'admin' && id) {
            fetchUserDetails();
        }
    }, [id, currentUser]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/users/${id}`);
            setUserData(response.data.user);
            setRelatedData(response.data.relatedData);
        } catch (error) {
            console.error('Error fetching user details:', error);
            toast.error('Failed to load user details');
            navigate('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!userData) return;

        const result = await Swal.fire({
            title: 'Change Status',
            text: `Are you sure you want to change status to ${newStatus}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, change it!'
        });

        if (result.isConfirmed) {
            try {
                await api.put(`/admin/users/${userData.id}`, { status: newStatus });
                setUserData({ ...userData, status: newStatus });
                toast.success(`Status updated to ${newStatus}`);
            } catch (error) {
                console.error('Error updating status:', error);
                toast.error('Failed to update status');
            }
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!userData) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="text-indigo-600 hover:text-indigo-900 mb-2 flex items-center"
                    >
                        ← Back to Users
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-900">User Details</h1>
                </div>
                <div className="flex space-x-3">
                    {userData.status !== 'active' && (
                        <button
                            onClick={() => handleStatusChange('active')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Activate User
                        </button>
                    )}
                    {userData.status === 'active' && (
                        <button
                            onClick={() => handleStatusChange('suspended')}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Suspend User
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="bg-white shadow rounded-lg p-6 md:col-span-1 h-fit">
                    <div className="flex flex-col items-center">
                        <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 text-3xl font-bold mb-4">
                            {userData.avatar ? (
                                <img src={userData.avatar} alt={userData.name} className="h-24 w-24 rounded-full object-cover" />
                            ) : (
                                userData.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
                        <p className="text-sm text-gray-500">{userData.email}</p>
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${userData.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                    userData.role === 'business_owner' ? 'bg-blue-100 text-blue-800' :
                                        'bg-green-100 text-green-800'
                                }`}>
                                {userData.role.toUpperCase().replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${userData.status === 'active' ? 'bg-green-100 text-green-800' :
                                    userData.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                }`}>
                                {userData.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <div className="mt-6 border-t border-gray-200 pt-4 space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Phone</label>
                            <p className="text-sm text-gray-900">{userData.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Joined</label>
                            <p className="text-sm text-gray-900">{formatDate(userData.created_at)}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Last Login</label>
                            <p className="text-sm text-gray-900">{formatDate(userData.last_login)}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Email Verified</label>
                            <p className={`text-sm ${userData.email_verified ? 'text-green-600' : 'text-red-600'}`}>
                                {userData.email_verified ? 'Yes' : 'No'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Related Data Section */}
                <div className="bg-white shadow rounded-lg p-6 md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {userData.role === 'business_owner' ? 'Businesses Owned' :
                            userData.role === 'client' ? 'Recent Appointments' :
                                userData.role === 'staff' ? 'Employment Details' : 'Activity Overview'}
                    </h3>

                    {userData.role === 'business_owner' && relatedData?.businesses && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {relatedData.businesses.length > 0 ? (
                                        relatedData.businesses.map((business: Business) => (
                                            <tr key={business.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{business.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{business.city}, {business.state}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${business.verification_status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {business.verification_status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-900 cursor-pointer" onClick={() => navigate(`/admin/businesses/${business.id}`)}>
                                                    View
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No businesses found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {userData.role === 'client' && relatedData?.appointments && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {relatedData.appointments.length > 0 ? (
                                        relatedData.appointments.map((apt: Appointment) => (
                                            <tr key={apt.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(apt.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.start_time}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {apt.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No appointments found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {userData.role === 'staff' && relatedData?.business && (
                        <div className="border rounded-md p-4">
                            <p className="text-sm text-gray-500">Works at:</p>
                            <h4 className="text-lg font-semibold text-gray-900">{relatedData.business.name}</h4>
                            <p className="text-sm text-gray-600">{relatedData.business.city}, {relatedData.business.state}</p>
                            <button
                                onClick={() => navigate(`/admin/businesses/${relatedData.business.id}`)}
                                className="mt-2 text-sm text-indigo-600 hover:text-indigo-900"
                            >
                                View Business Details
                            </button>
                        </div>
                    )}

                    {/* Fallback for admins or empty data */}
                    {(!relatedData || (Object.keys(relatedData).length === 0 && userData.role !== 'admin')) && (
                        <p className="text-gray-500 text-sm">No additional data available for this user.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetailPage;

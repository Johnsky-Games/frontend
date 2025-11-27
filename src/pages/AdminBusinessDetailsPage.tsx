import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/ApiService';
import { toast } from 'react-toastify';

interface Business {
    id: number;
    owner_id: number;
    owner_name?: string;
    name: string;
    description: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    zip_code: string | null;
    logo: string | null;
    cover_image: string | null;
    whatsapp: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    tiktok_url: string | null;
    youtube_url: string | null;
    is_active: boolean;
    is_verified: boolean;
    verification_status: 'pending' | 'approved' | 'rejected';
    average_rating?: number;
    total_reviews?: number;
    subscription_plan?: string;
    subscription_status?: string;
    created_at: string;
    updated_at: string;
}

const AdminBusinessDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const response = await api.get(`/admin/businesses/${id}`);
                setBusiness(response.data.data || response.data);
            } catch (error) {
                console.error('Error fetching business details:', error);
                toast.error('Failed to load business details');
                navigate('/admin/businesses');
            } finally {
                setLoading(false);
            }
        };
        if (user?.role === 'admin') {
            fetchBusiness();
        } else {
            navigate('/login');
        }
    }, [id, user, navigate]);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleChangeStatus = async (newStatus: 'approved' | 'rejected' | 'pending') => {
        if (!business) return;
        const result = await Swal.fire({
            title: 'Confirm Status Change',
            text: `Are you sure you want to set status to ${newStatus}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, change it!'
        });
        if (!result.isConfirmed) return;
        try {
            const response = await api.patch(`/admin/businesses/${business.id}/status`, { status: newStatus });
            toast.success(response.data.message || `Business status set to ${newStatus}`);
            setBusiness({
                ...business,
                verification_status: newStatus,
                is_verified: newStatus === 'approved'
            });
        } catch (error: any) {
            console.error('Error changing business status:', error);
            toast.error(error.response?.data?.message || 'Failed to change status');
        }
    };

    const handleToggleActive = async () => {
        if (!business) return;
        const newActiveStatus = !business.is_active;
        const result = await Swal.fire({
            title: 'Confirm Status Change',
            text: `Are you sure you want to ${newActiveStatus ? 'activate' : 'suspend'} this business?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, change it!'
        });
        if (!result.isConfirmed) return;
        try {
            await api.patch(`/admin/businesses/${business.id}/active`, { is_active: newActiveStatus });
            toast.success(`Business ${newActiveStatus ? 'activated' : 'suspended'} successfully`);
            setBusiness({ ...business, is_active: newActiveStatus });
        } catch (error: any) {
            console.error('Error changing active status:', error);
            toast.error(error.response?.data?.message || 'Failed to change active status');
        }
    };

    const handleApprove = () => handleChangeStatus('approved');
    const handleReject = () => handleChangeStatus('rejected');
    const handleSetPending = () => handleChangeStatus('pending');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!business) {
        return <div>Business not found</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">{business.name}</h1>
                    <p className="mt-1 text-sm text-gray-500">Business ID: {business.id}</p>
                </div>
                <button
                    onClick={() => navigate('/admin/businesses')}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                    Back to List
                </button>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Verification</div>
                    <div className={`text-lg font-semibold ${business.verification_status === 'approved' ? 'text-green-600' : business.verification_status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {business.verification_status.charAt(0).toUpperCase() + business.verification_status.slice(1)}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Status</div>
                    <div className={`text-lg font-semibold ${business.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {business.is_active ? 'Active' : 'Suspended'}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Rating</div>
                    <div className="text-lg font-semibold text-gray-900">
                        {business.average_rating ? `${Number(business.average_rating).toFixed(1)} ⭐` : 'No ratings'}
                    </div>
                    {business.total_reviews && <div className="text-xs text-gray-500">{business.total_reviews} reviews</div>}
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Subscription</div>
                    <div className="text-lg font-semibold text-gray-900">
                        {business.subscription_plan || 'None'}
                    </div>
                    {business.subscription_status && <div className="text-xs text-gray-500">{business.subscription_status}</div>}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white shadow sm:rounded-lg mb-6 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                <div className="flex flex-wrap gap-3">
                    {business.verification_status === 'pending' && (
                        <>
                            <button onClick={handleApprove} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                                ✓ Approve Verification
                            </button>
                            <button onClick={handleReject} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                                ✗ Reject Verification
                            </button>
                        </>
                    )}
                    {(business.verification_status === 'approved' || business.verification_status === 'rejected') && (
                        <button onClick={handleSetPending} className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700">
                            Set to Pending
                        </button>
                    )}
                    <button
                        onClick={handleToggleActive}
                        className={`${business.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-md`}
                    >
                        {business.is_active ? 'Suspend Business' : 'Activate Business'}
                    </button>
                </div>
            </div>

            {/* Business Information */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Business Information</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">General details and contact information.</p>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Owner Name</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{business.owner_name || 'N/A'}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{business.email}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Phone</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{business.phone || 'N/A'}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">WhatsApp</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{business.whatsapp || 'N/A'}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{business.description || 'No description provided'}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Address</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {business.address || 'N/A'}<br />
                                {business.city && `${business.city}, `}{business.state} {business.zip_code}<br />
                                {business.country}
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Created At</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(business.created_at)}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(business.updated_at)}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Social Media Links */}
            {(business.facebook_url || business.instagram_url || business.twitter_url || business.tiktok_url || business.youtube_url) && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Social Media</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Connected social media accounts.</p>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                        <div className="flex flex-wrap gap-4">
                            {business.facebook_url && (
                                <a href={business.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                    Facebook
                                </a>
                            )}
                            {business.instagram_url && (
                                <a href={business.instagram_url} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800">
                                    Instagram
                                </a>
                            )}
                            {business.twitter_url && (
                                <a href={business.twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                                    Twitter/X
                                </a>
                            )}
                            {business.tiktok_url && (
                                <a href={business.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-700">
                                    TikTok
                                </a>
                            )}
                            {business.youtube_url && (
                                <a href={business.youtube_url} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800">
                                    YouTube
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBusinessDetailsPage;

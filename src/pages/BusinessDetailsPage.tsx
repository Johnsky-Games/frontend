import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Facebook, Instagram, Twitter, Linkedin, MessageCircle, Clock, Calendar, Youtube } from 'lucide-react';
import { toast } from 'react-toastify';
import ApiService from '../services/ApiService';
import { useAuth } from '../context/AuthContext';
import FavoriteButton from '../components/FavoriteButton';
import StarRating from '../components/StarRating';
import RatingList from '../components/RatingList';
import RatingForm from '../components/RatingForm';
import Header from '../components/Header';

interface Business {
    id: number;
    name: string;
    description: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    category: string | null;
    facebook_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    linkedin_url?: string;
    tiktok_url?: string;
    youtube_url?: string;
    whatsapp_number?: string;
    whatsapp_link?: string;
    website_url?: string;
    map_url?: string;
    latitude?: number;
    longitude?: number;
    average_rating?: number;
    business_hours?: any;
    total_ratings?: number;
}

// Custom TikTok Icon since it might not be in all lucide versions
const TiktokIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

const BusinessDetailsPage: React.FC = () => {
    const { businessId } = useParams<{ businessId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [ratings, setRatings] = useState([]);
    const [loadingRatings, setLoadingRatings] = useState(false);
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [userRating, setUserRating] = useState<any>(null);

    const [services, setServices] = useState([]);

    useEffect(() => {
        if (businessId) {
            fetchBusinessDetails();
            fetchRatings();
            fetchServices();
            if (user) {
                fetchUserRating();
            }
        }
    }, [businessId, user]);

    async function fetchServices() {
        try {
            const response = await ApiService.get(`/businesses/${businessId}/services`);
            setServices(response.data.services);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    }

    async function fetchBusinessDetails() {
        try {
            const response = await ApiService.get(`/businesses/${businessId}`);
            setBusiness(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching business details:', error);
            toast.error('Failed to load business details');
            navigate('/businesses');
        } finally {
            setLoading(false);
        }
    }

    async function fetchRatings() {
        if (!businessId) return;
        setLoadingRatings(true);
        try {
            const response = await ApiService.get(`/businesses/${businessId}/ratings`);
            setRatings(response.data.ratings);
        } catch (error) {
            console.error('Error fetching ratings:', error);
        } finally {
            setLoadingRatings(false);
        }
    }

    async function fetchUserRating() {
        try {
            const response = await ApiService.get(`/businesses/${businessId}/ratings/me`);
            setUserRating(response.data.rating);
        } catch (error) {
            console.error('Error fetching user rating:', error);
        }
    }

    const handleRatingSuccess = () => {
        fetchRatings();
        fetchBusinessDetails(); // Refresh average rating
        fetchUserRating();
    };

    const handleBookAppointment = () => {
        if (!user) {
            toast.info('Please login to book an appointment');
            navigate('/login', { state: { from: `/businesses/${businessId}` } });
            return;
        }
        navigate(`/client/services?business_id=${businessId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!business) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Business not found</h2>
                <button
                    onClick={() => navigate('/businesses')}
                    className="mt-4 text-purple-600 hover:text-purple-500"
                >
                    Browse all businesses
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-12">
            <Header />
            {/* Header / Banner */}
            <div className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{business.name}</h1>
                            <div className="flex items-center gap-2 mt-2 text-gray-500 dark:text-gray-400">
                                <MapPin size={18} />
                                <span>{business.city}, {business.state}</span>
                                <span className="mx-2">•</span>
                                <span className="capitalize">{business.category?.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-center gap-1">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {business.average_rating ? Number(business.average_rating).toFixed(1) : 'New'}
                                    </span>
                                    <StarRating rating={Number(business.average_rating) || 0} readonly size="md" />
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                                        ({business.total_ratings || 0} reviews)
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {user && <FavoriteButton businessId={business.id} size="lg" showLabel />}
                            <button
                                onClick={handleBookAppointment}
                                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md flex items-center gap-2"
                            >
                                <Calendar size={20} />
                                Book Appointment
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About</h2>
                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                                {business.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Services */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Services</h2>
                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                                    ))}
                                </div>
                            ) : services.length > 0 ? (
                                <div className="space-y-4">
                                    {services.map((service: any) => (
                                        <div key={service.id} className="flex justify-between items-center p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:border-purple-100 dark:hover:border-purple-900 transition-colors">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{service.description}</p>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {service.duration} min
                                                    </span>
                                                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                                                        ${Number(service.price).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/client/services?business_id=${businessId}&service_id=${service.id}`)}
                                                className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                                            >
                                                Book
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No services available yet.</p>
                            )}
                        </div>

                        {/* Reviews */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reviews</h2>
                                {user && (
                                    <button
                                        onClick={() => setShowRatingForm(true)}
                                        className="text-purple-600 font-medium hover:text-purple-700"
                                    >
                                        {userRating ? 'Edit Your Review' : 'Write a Review'}
                                    </button>
                                )}
                            </div>
                            <RatingList ratings={ratings} loading={loadingRatings} />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact & Location */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact & Location</h3>
                            <div className="space-y-4">
                                {business.address && (
                                    <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                                        <MapPin className="shrink-0 mt-1" size={20} />
                                        <div>
                                            <p>{business.address}</p>
                                            <p>{business.city}, {business.state} {business.zip_code}</p>
                                            {business.map_url && (
                                                <a
                                                    href={business.map_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-purple-600 dark:text-purple-400 text-sm hover:underline mt-1 inline-block"
                                                >
                                                    View on Map
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {business.phone && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Phone className="shrink-0" size={20} />
                                        <a href={`tel:${business.phone}`} className="hover:text-purple-600">
                                            {business.phone}
                                        </a>
                                    </div>
                                )}

                                {business.email && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Mail className="shrink-0" size={20} />
                                        <a href={`mailto:${business.email}`} className="hover:text-purple-600">
                                            {business.email}
                                        </a>
                                    </div>
                                )}

                                {business.website_url && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Globe className="shrink-0" size={20} />
                                        <a
                                            href={business.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-purple-600 truncate"
                                        >
                                            Website
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Social Media */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Social Media</h4>
                                <div className="flex gap-4 flex-wrap">
                                    {business.facebook_url && (
                                        <a href={business.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-colors" title="Facebook">
                                            <Facebook size={24} />
                                        </a>
                                    )}
                                    {business.instagram_url && (
                                        <a href={business.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E4405F] transition-colors" title="Instagram">
                                            <Instagram size={24} />
                                        </a>
                                    )}
                                    {business.twitter_url && (
                                        <a href={business.twitter_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1DA1F2] transition-colors" title="X (Twitter)">
                                            <Twitter size={24} />
                                        </a>
                                    )}
                                    {business.linkedin_url && (
                                        <a href={business.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0A66C2] transition-colors" title="LinkedIn">
                                            <Linkedin size={24} />
                                        </a>
                                    )}
                                    {business.tiktok_url && (
                                        <a href={business.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#000000] transition-colors" title="TikTok">
                                            <TiktokIcon size={24} />
                                        </a>
                                    )}
                                    {business.youtube_url && (
                                        <a href={business.youtube_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#FF0000] transition-colors" title="YouTube">
                                            <Youtube size={24} />
                                        </a>
                                    )}
                                    {business.whatsapp_link && (
                                        <a href={business.whatsapp_link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#25D366] transition-colors" title="WhatsApp">
                                            <MessageCircle size={24} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Opening Hours */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Opening Hours</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                {(() => {
                                    if (!business.business_hours) {
                                        return <p className="text-gray-500 italic">Hours not available</p>;
                                    }

                                    let hours = business.business_hours;
                                    // Handle if it's a JSON string
                                    if (typeof hours === 'string') {
                                        try {
                                            hours = JSON.parse(hours);
                                        } catch (e) {
                                            return <p className="text-red-400">Error loading hours</p>;
                                        }
                                    }

                                    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

                                    return days.map(day => {
                                        const schedule = (hours as any)[day];
                                        if (!schedule) return null;

                                        const isClosed = schedule.closed || (!schedule.open && !schedule.close);

                                        return (
                                            <div key={day} className="flex justify-between capitalize">
                                                <span className="font-medium">{day}</span>
                                                {isClosed ? (
                                                    <span className="text-red-500">Closed</span>
                                                ) : (
                                                    <span>{schedule.open} - {schedule.close}</span>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showRatingForm && business && (
                <RatingForm
                    businessId={business.id}
                    businessName={business.name}
                    existingRating={userRating}
                    onClose={() => setShowRatingForm(false)}
                    onSuccess={handleRatingSuccess}
                />
            )}
        </div>
    );
};

export default BusinessDetailsPage;

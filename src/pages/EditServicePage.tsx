import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/ApiService';

const EditServicePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: '',
        price: '',
        category: '',
        is_active: true
    });

    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await api.get(`/business-owner/services/${id}`);
                if (response.data.code === 'SUCCESS') {
                    const service = response.data.service;
                    setFormData({
                        name: service.name || '',
                        description: service.description || '',
                        duration: service.duration?.toString() || '',
                        price: service.price?.toString() || '',
                        category: service.category || '',
                        is_active: service.is_active
                    });
                    // Set current image if exists
                    if (service.image) {
                        setCurrentImage(service.image);
                    }
                }
            } catch (error: any) {
                console.error('Fetch service error:', error);
                toast.error('Failed to load service');
                navigate('/business-owner/services');
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'business_owner') {
            fetchService();
        }
    }, [id, user, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Image size must be less than 10MB');
                return;
            }
            setImageFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.duration || !formData.price) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);

            // Create FormData for multipart/form-data
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('description', formData.description || '');
            submitData.append('duration', formData.duration);
            submitData.append('price', formData.price);
            submitData.append('category', formData.category || '');
            submitData.append('is_active', formData.is_active.toString());

            if (imageFile) {
                submitData.append('service_image', imageFile);
            }

            const response = await api.put(`/business-owner/services/${id}`, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.code === 'SUCCESS') {
                toast.success('Service updated successfully!');
                navigate('/business-owner/services');
            } else {
                toast.error(response.data.message || 'Failed to update service');
            }
        } catch (error: any) {
            console.error('Update service error:', error);
            toast.error(error.response?.data?.message || 'Failed to update service');
        } finally {
            setSubmitting(false);
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

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Edit Service</h1>
                <p className="mt-1 text-sm text-gray-500">Update service information</p>
            </div>

            <div className="bg-white shadow sm:rounded-lg">
                <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
                    <div className="space-y-6">
                        {/* Service Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Service Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        {/* Duration and Price */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                                    Duration (minutes) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="duration"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                    Price ($) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">Select a category</option>
                                <option value="hair">Hair Services</option>
                                <option value="nails">Nail Services</option>
                                <option value="spa">Spa Services</option>
                                <option value="beauty">Beauty Treatments</option>
                                <option value="massage">Massage</option>
                                <option value="facial">Facial</option>
                                <option value="waxing">Waxing</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Service Image */}
                        <div>
                            <label htmlFor="service_image" className="block text-sm font-medium text-gray-700">
                                Service Image
                            </label>

                            {/* Current Image */}
                            {currentImage && !imagePreview && (
                                <div className="mt-2">
                                    <p className="text-xs text-gray-500 mb-2">Current image:</p>
                                    <img
                                        src={`http://localhost:5000${currentImage}`}
                                        alt="Current service"
                                        className="h-32 w-32 object-cover rounded-md border border-gray-300"
                                    />
                                </div>
                            )}

                            {/* File Input */}
                            <div className="mt-2 flex items-center space-x-4">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        id="service_image"
                                        name="service_image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        {currentImage ? 'Upload a new image to replace the current one' : 'PNG, JPG, GIF up to 10MB'}
                                    </p>
                                </div>
                            </div>

                            {/* New Image Preview */}
                            {imagePreview && (
                                <div className="mt-4">
                                    <p className="text-xs text-gray-500 mb-2">New image preview:</p>
                                    <img
                                        src={imagePreview}
                                        alt="New service preview"
                                        className="h-32 w-32 object-cover rounded-md border border-gray-300"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                Service is active and available for booking
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/business-owner/services')}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Updating...' : 'Update Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditServicePage;

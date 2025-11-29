import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/ApiService';
import BusinessHoursEditor from '../components/BusinessHoursEditor';
import SpecialHoursEditor from '../components/SpecialHoursEditor';

const BusinessProfilePage: React.FC = () => {
  const { business, user, refreshBusiness } = useAuth();
  const { setBusinessTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    phone: '',
    email: '',
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
    accent_color: '#8B5CF6',
    theme_mode: 'light',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
    tiktok_url: '',
    youtube_url: '',
    whatsapp_number: '',
    website_url: '',
    map_url: '',
    latitude: '',
    longitude: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);

  // Handle error alerts using useEffect to avoid issues in try/catch
  React.useEffect(() => {
    const showErrorAlert = async () => {
      if (error) {
        Swal.close();
        await Swal.fire({
          icon: 'error',
          title: 'Error Updating Business Profile',
          text: error,
          confirmButtonText: 'OK',
          confirmButtonColor: '#EF4444',
          timer: 8000,
          timerProgressBar: true,
          allowOutsideClick: true,
        });
        setError(null);
      }
    };
    showErrorAlert();
  }, [error]);

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || '',
        description: business.description || '',
        address: business.address || '',
        city: business.city || '',
        state: business.state || '',
        country: business.country || '',
        zip_code: business.zip_code || '',
        phone: business.phone || '',
        email: business.email || '',
        primary_color: business.primary_color || '#3B82F6',
        secondary_color: business.secondary_color || '#10B981',
        accent_color: business.accent_color || '#8B5CF6',
        theme_mode: business.theme_mode || 'light',
        facebook_url: business.facebook_url || '',
        instagram_url: business.instagram_url || '',
        twitter_url: business.twitter_url || '',
        linkedin_url: business.linkedin_url || '',
        tiktok_url: business.tiktok_url || '',
        youtube_url: business.youtube_url || '',
        whatsapp_number: business.whatsapp_number || '',
        website_url: business.website_url || '',
        map_url: business.map_url || '',
        latitude: business.latitude || '',
        longitude: business.longitude || ''
      });
      setVerificationRequested(!!business.verification_requested);
      setLoading(false);
    } else if (user) {
      setLoading(false);
    }
  }, [business, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile || !business) return;

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await api.patch(`/businesses/${business.id}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.code === 'SUCCESS') {
        toast.success('Logo uploaded successfully!');
        setLogoFile(null);
        setLogoPreview(null);
        // Refresh business data from context
        await refreshBusiness();
      }
    } catch (error: any) {
      console.error('Upload logo error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      setCoverImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageUpload = async () => {
    if (!coverImageFile || !business) return;

    try {
      setUploadingCoverImage(true);
      const formData = new FormData();
      formData.append('cover_image', coverImageFile);

      const response = await api.patch(`/businesses/${business.id}/cover-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.code === 'SUCCESS') {
        toast.success('Cover image uploaded successfully!');
        setCoverImageFile(null);
        // Refresh business data from context
        await refreshBusiness();
      }
    } catch (error: any) {
      console.error('Upload cover image error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload cover image');
    } finally {
      setUploadingCoverImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    try {
      setLoading(true);

      // Update Social Media
      await api.patch(`/businesses/${business.id}/social-media`, {
        facebook_url: formData.facebook_url,
        instagram_url: formData.instagram_url,
        twitter_url: formData.twitter_url,
        linkedin_url: formData.linkedin_url,
        tiktok_url: formData.tiktok_url,
        youtube_url: formData.youtube_url,
        whatsapp_number: formData.whatsapp_number,
        website_url: formData.website_url
      });

      // Update Location
      await api.patch(`/businesses/${business.id}/location`, {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        country: formData.country,
        latitude: formData.latitude,
        longitude: formData.longitude,
        map_url: formData.map_url
      });

      toast.success('Business profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating business profile:', error);
      setError(error.response?.data?.message || 'Failed to update business profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationRequest = async () => {
    if (!business) {
      setError('No business found to verify.');
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Request Business Verification',
        text: 'Are you sure you want to request verification for your business? This will notify the administrators.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, request verification',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#3B82F6',
      });

      if (result.isConfirmed) {
        const response = await api.post(`/businesses/${business.id}/request-verification`, {});
        setVerificationRequested(true);
        toast.success(response.data.message || 'Verification request submitted successfully!');
      }
    } catch (error: any) {
      console.error('Error requesting verification:', error);
      setError(error.response?.data?.error || error.response?.data?.message || 'Failed to request verification. Please try again.');
    }
  };

  const handleSaveBusinessHours = async (businessHours: any) => {
    if (!business) return;

    try {
      const response = await api.patch('/business-owner/business-hours', {
        business_hours: businessHours
      });

      if (response.data.code === 'SUCCESS') {
        // Refresh business data to get updated hours
        await refreshBusiness();
      }
    } catch (error: any) {
      console.error('Save business hours error:', error);
      throw error; // Re-throw to let BusinessHoursEditor handle the error display
    }
  };

  const handleThemeUpdate = async () => {
    if (!business) return;

    try {
      const response = await api.patch(`/businesses/${business.id}/theme`, {
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        accent_color: formData.accent_color
      });

      if (response.data.code === 'SUCCESS') {
        toast.success('Theme updated successfully!');

        // Apply theme immediately
        setBusinessTheme({
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          accent_color: formData.accent_color,
          theme_mode: formData.theme_mode
        });

        // Refresh business data
        await refreshBusiness();
      }
    } catch (error: any) {
      console.error('Update theme error:', error);
      toast.error(error.response?.data?.message || 'Failed to update theme');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (user && user.role !== 'business_owner') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Access Denied</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
              <p>Only business owners can manage business profiles.</p>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (!user && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Access Required</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
              <p>Please sign in to access this page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Business Profile</h1>

      {business && (
        <div className="mb-6">
          {business.verification_status === 'approved' && business.is_verified ? (
            <div className="bg-accent-50 dark:bg-purple-900/20 border border-accent-200 dark:border-purple-700 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-accent-400 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-accent-800 dark:text-purple-200">Business Verified</h3>
                  <div className="mt-2 text-sm text-accent-700 dark:text-purple-300">
                    <p>Your business has been verified and is visible to customers.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : business.verification_status === 'rejected' ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400 dark:text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Business Verification Rejected</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>Your business verification was rejected. {business.verification_notes && `Reason: ${business.verification_notes}`}</p>
                    <button
                      type="button"
                      onClick={handleVerificationRequest}
                      className="mt-2 font-medium text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
                    >
                      Request Verification Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : business.verification_status === 'pending' || verificationRequested ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Verification Pending</h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>Your business verification request is under review by our administrators.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-secondary-50 dark:bg-emerald-900/20 border border-secondary-200 dark:border-emerald-700 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-secondary-400 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-secondary-800 dark:text-emerald-200">Ready for Verification</h3>
                  <div className="mt-2 text-sm text-secondary-700 dark:text-emerald-300">
                    <p>Your business profile is complete and ready for verification.</p>
                    <button
                      type="button"
                      onClick={handleVerificationRequest}
                      className="mt-2 font-medium text-secondary-700 dark:text-emerald-300 hover:text-secondary-900 dark:hover:text-emerald-100"
                    >
                      Request Business Verification
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Business Logo</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Upload your business logo</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
              <div className="flex items-center justify-center w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-full h-full object-cover"
                  />
                ) : business?.logo ? (
                  <img
                    src={business.logo}
                    alt="Business Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">No logo</span>
                )}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Logo</label>
                <div className="mt-1 flex justify-center">
                  <div className="flex items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label htmlFor="logo-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500">
                          <span>Upload a file</span>
                          <input
                            id="logo-upload"
                            name="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>
                {logoFile && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mt-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Cover Image</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Upload your business cover image</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
              <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-md">
                {coverImagePreview ? (
                  <img
                    src={coverImagePreview}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                ) : business?.cover_image ? (
                  <img
                    src={business.cover_image}
                    alt="Cover Image"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No cover image
                  </div>
                )}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Cover Image</label>
                <div className="mt-1 flex justify-center">
                  <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="cover-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                          <span>Upload a file</span>
                          <input
                            id="cover-upload"
                            name="cover-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>
                {coverImageFile && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleCoverImageUpload}
                      disabled={uploadingCoverImage}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {uploadingCoverImage ? 'Uploading...' : 'Upload Cover Image'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Business Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Update your business details</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
                <div className="space-y-8 divide-y divide-gray-200">
                  <div>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Business Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Contact Information</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        How customers can reach you.
                      </p>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email address
                        </label>
                        <div className="mt-1">
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone Number
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          WhatsApp Number
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="whatsapp_number"
                            id="whatsapp_number"
                            value={formData.whatsapp_number}
                            onChange={handleChange}
                            placeholder="+1234567890"
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Website URL
                        </label>
                        <div className="mt-1">
                          <input
                            type="url"
                            name="website_url"
                            id="website_url"
                            value={formData.website_url}
                            onChange={handleChange}
                            placeholder="https://example.com"
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Social Media</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Connect your social media profiles.
                      </p>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Facebook URL
                        </label>
                        <div className="mt-1">
                          <input
                            type="url"
                            name="facebook_url"
                            id="facebook_url"
                            value={formData.facebook_url}
                            onChange={handleChange}
                            placeholder="https://facebook.com/..."
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Instagram URL
                        </label>
                        <div className="mt-1">
                          <input
                            type="url"
                            name="instagram_url"
                            id="instagram_url"
                            value={formData.instagram_url}
                            onChange={handleChange}
                            placeholder="https://instagram.com/..."
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="twitter_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          X (Twitter) URL
                        </label>
                        <div className="mt-1">
                          <input
                            type="url"
                            name="twitter_url"
                            id="twitter_url"
                            value={formData.twitter_url}
                            onChange={handleChange}
                            placeholder="https://x.com/..."
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          LinkedIn URL
                        </label>
                        <div className="mt-1">
                          <input
                            type="url"
                            name="linkedin_url"
                            id="linkedin_url"
                            value={formData.linkedin_url}
                            onChange={handleChange}
                            placeholder="https://linkedin.com/..."
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="tiktok_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          TikTok URL
                        </label>
                        <div className="mt-1">
                          <input
                            type="url"
                            name="tiktok_url"
                            id="tiktok_url"
                            value={formData.tiktok_url}
                            onChange={handleChange}
                            placeholder="https://tiktok.com/@..."
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="youtube_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          YouTube URL
                        </label>
                        <div className="mt-1">
                          <input
                            type="url"
                            name="youtube_url"
                            id="youtube_url"
                            value={formData.youtube_url}
                            onChange={handleChange}
                            placeholder="https://youtube.com/@..."
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Theme Customization</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Configure your business brand colors. These colors will be applied throughout your business profile.
                      </p>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-2">
                        <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Primary Color
                        </label>
                        <div className="mt-1 flex items-center space-x-3">
                          <input
                            type="color"
                            name="primary_color"
                            id="primary_color"
                            value={formData.primary_color}
                            onChange={handleChange}
                            className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.primary_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                            className="flex-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Main brand color</p>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="secondary_color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Secondary Color
                        </label>
                        <div className="mt-1 flex items-center space-x-3">
                          <input
                            type="color"
                            name="secondary_color"
                            id="secondary_color"
                            value={formData.secondary_color}
                            onChange={handleChange}
                            className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.secondary_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                            className="flex-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Complementary color</p>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="accent_color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Accent Color
                        </label>
                        <div className="mt-1 flex items-center space-x-3">
                          <input
                            type="color"
                            name="accent_color"
                            id="accent_color"
                            value={formData.accent_color}
                            onChange={handleChange}
                            className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.accent_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                            className="flex-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Highlight color</p>
                      </div>

                      <div className="sm:col-span-6">
                        <button
                          type="button"
                          onClick={handleThemeUpdate}
                          className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Apply Theme Colors
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Location</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Where your business is located.
                      </p>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-6">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Street Address
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="address"
                            id="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          City
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="city"
                            id="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          State / Province
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="state"
                            id="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          ZIP / Postal Code
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="zip_code"
                            id="zip_code"
                            value={formData.zip_code}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Latitude
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            step="any"
                            name="latitude"
                            id="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Longitude
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            step="any"
                            name="longitude"
                            id="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="map_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Google Maps URL
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <input
                            type="url"
                            name="map_url"
                            id="map_url"
                            value={formData.map_url}
                            onChange={handleChange}
                            placeholder="https://goo.gl/maps/..."
                            className="flex-1 focus:ring-primary-500 focus:border-primary-500 block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300"
                          />
                          <a
                            href={formData.map_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm ${!formData.map_url ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'}`}
                          >
                            Test Link
                          </a>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          You can paste the "Share" link from Google Maps here.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-5">
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Business Hours Section */}
      <div className="mt-6">
        <BusinessHoursEditor
          initialHours={business?.business_hours}
          onSave={handleSaveBusinessHours}
          loading={loading}
        />
      </div>

      {/* Special Hours Section */}
      <div className="mt-6">
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Special Hours (Holidays & Exceptions)</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Configure specific dates when your business is closed or has different hours.</p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
            <SpecialHoursEditor />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfilePage;
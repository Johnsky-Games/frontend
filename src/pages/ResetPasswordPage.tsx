import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../services/ApiService';
import { toast } from 'react-toastify';

const ResetPasswordPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Password strength checker
    const checkPasswordStrength = (password: string) => {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        return requirements;
    };

    const requirements = checkPasswordStrength(formData.password);
    const allRequirementsMet = Object.values(requirements).every(req => req);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!allRequirementsMet) {
            toast.error('Please meet all password requirements');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                token,
                password: formData.password
            });

            setSuccess(true);
            toast.success('✅ Password reset successfully!');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error: any) {
            console.error('Reset password error:', error);
            const message = error.response?.data?.message || 'Failed to reset password. The link may have expired.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
                    <p className="text-gray-600 mb-4">
                        Your password has been successfully reset.
                    </p>
                    <p className="text-sm text-gray-500">
                        Redirecting to login page...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="bg-blue-100 p-4 rounded-full">
                                <Lock className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Reset Your Password
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter your new password below
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* New Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Password Requirements */}
                        {formData.password && (
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                                <div className="space-y-1">
                                    <div className={`text-xs flex items-center ${requirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                                        {requirements.length ? '✓' : '○'} At least 8 characters
                                    </div>
                                    <div className={`text-xs flex items-center ${requirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                                        {requirements.uppercase ? '✓' : '○'} One uppercase letter
                                    </div>
                                    <div className={`text-xs flex items-center ${requirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                                        {requirements.lowercase ? '✓' : '○'} One lowercase letter
                                    </div>
                                    <div className={`text-xs flex items-center ${requirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                                        {requirements.number ? '✓' : '○'} One number
                                    </div>
                                    <div className={`text-xs flex items-center ${requirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                                        {requirements.special ? '✓' : '○'} One special character (!@#$%^&*...)
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !allRequirementsMet}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${(loading || !allRequirementsMet) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                                    Resetting...
                                </div>
                            ) : (
                                'Reset Password'
                            )}
                        </button>

                        {/* Back to Login */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                ← Back to Login
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security Note */}
                <div className="text-center text-xs text-gray-500 px-4">
                    <p>This password reset link will expire in 1 hour for security reasons.</p>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;

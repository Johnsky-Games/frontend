import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import { Lock, Eye, EyeOff, Shield, Check, X } from 'lucide-react';

const ChangePasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Password strength indicator
    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        if (strength <= 1) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
        if (strength <= 3) return { strength: 2, label: 'Medium', color: 'bg-yellow-500' };
        return { strength: 3, label: 'Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(formData.newPassword);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        try {
            await ApiService.post('/auth/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            // Password changed successfully
            // Check if email verification is needed
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                if (!user.email_verified && user.is_admin_collaborator) {
                    navigate('/verify-email-reminder');
                } else {
                    navigate('/admin/dashboard');
                }
            } else {
                navigate('/admin/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full">
                {/* Header Card */}
                <div className="bg-white rounded-t-2xl p-8 shadow-2xl">
                    <div className="flex items-center justify-center mb-6">
                        <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full">
                            <Shield className="h-12 w-12 text-blue-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
                        Change Password Required
                    </h1>
                    <p className="text-center text-gray-600 text-sm">
                        For security reasons, you must change your temporary password before continuing.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-b-2xl p-8 shadow-2xl border-t-2 border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Temporary Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    required
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    required
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {formData.newPassword && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-gray-600">Password Strength:</span>
                                        <span className={`font-medium ${passwordStrength.strength === 1 ? 'text-red-600' :
                                                passwordStrength.strength === 2 ? 'text-yellow-600' :
                                                    'text-green-600'
                                            }`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1.5 flex-1 rounded-full ${level <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Password Requirements */}
                                    <div className="mt-3 space-y-1">
                                        <PasswordRequirement
                                            met={formData.newPassword.length >= 8}
                                            text="At least 8 characters"
                                        />
                                        <PasswordRequirement
                                            met={/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword)}
                                            text="Upper and lowercase letters"
                                        />
                                        <PasswordRequirement
                                            met={/\d/.test(formData.newPassword)}
                                            text="At least one number"
                                        />
                                        <PasswordRequirement
                                            met={/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)}
                                            text="At least one special character"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || formData.newPassword !== formData.confirmPassword}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                        >
                            {loading ? 'Changing Password...' : 'Change Password & Continue'}
                        </button>
                    </form>
                </div>

                {/* Info Box */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-800 text-center">
                        <strong>Note:</strong> This is a one-time required step for your security.
                        Please choose a strong, unique password.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Helper component for password requirements
interface PasswordRequirementProps {
    met: boolean;
    text: string;
}

const PasswordRequirement: React.FC<PasswordRequirementProps> = ({ met, text }) => (
    <div className="flex items-center gap-2">
        {met ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
            <X className="h-3.5 w-3.5 text-gray-300" />
        )}
        <span className={`text-xs ${met ? 'text-green-700' : 'text-gray-500'}`}>
            {text}
        </span>
    </div>
);

export default ChangePasswordPage;

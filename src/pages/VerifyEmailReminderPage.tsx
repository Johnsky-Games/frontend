import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import { Mail, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';

const VerifyEmailReminderPage: React.FC = () => {
    const navigate = useNavigate();
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);
    const [error, setError] = useState<string>('');

    const userEmail = JSON.parse(localStorage.getItem('userData') || '{}').email || 'your email';

    const handleResendEmail = async () => {
        setResending(true);
        setError('');
        try {
            await ApiService.post('/auth/resend-verification');
            setResent(true);
            setTimeout(() => setResent(false), 5000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend email');
        } finally {
            setResending(false);
        }
    };

    const handleCheckStatus = async () => {
        try {
            const response = await ApiService.get('/auth/me');
            if (response.data.user.email_verified) {
                navigate('/admin/dashboard');
            } else {
                setError('Email not verified yet. Please check your inbox.');
                setTimeout(() => setError(''), 3000);
            }
        } catch (err) {
            console.error('Error checking verification status:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full">
                {/* Main Card */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                    {/* Icon */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative">
                            <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
                                <Mail className="h-16 w-16 text-blue-600" />
                            </div>
                            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 animate-bounce">
                                <span className="text-xs">!</span>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
                        Verify Your Email
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        We've sent a verification email to
                    </p>
                    <p className="text-center text-blue-600 font-medium mb-6 break-all">
                        {userEmail}
                    </p>

                    {/* Instructions */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Next Steps:</h3>
                        <ol className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2 text-xs font-bold">1</span>
                                <span>Check your email inbox (and spam folder)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2 text-xs font-bold">2</span>
                                <span>Click the verification link in the email</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2 text-xs font-bold">3</span>
                                <span>Return here and click "I've Verified My Email" to continue</span>
                            </li>
                        </ol>
                    </div>

                    {/* Success Message */}
                    {resent && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm text-green-700">Verification email resent successfully!</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleCheckStatus}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg flex items-center justify-center"
                        >
                            <CheckCircle className="mr-2 h-5 w-5" />
                            I've Verified My Email
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </button>

                        <button
                            onClick={handleResendEmail}
                            disabled={resending}
                            className="w-full py-3 px-4 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                        >
                            <RefreshCw className={`mr-2 h-5 w-5 ${resending ? 'animate-spin' : ''}`} />
                            {resending ? 'Resending...' : 'Resend Verification Email'}
                        </button>
                    </div>
                </div>

                {/* Help Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 text-sm">Having trouble?</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Check your spam/junk folder</li>
                        <li>• Make sure {userEmail} is correct</li>
                        <li>• Wait a few minutes and try resending</li>
                        <li>• Contact your administrator for assistance</li>
                    </ul>
                </div>

                {/* Security Note */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-white opacity-75">
                        🔒 Email verification is required for security purposes
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailReminderPage;

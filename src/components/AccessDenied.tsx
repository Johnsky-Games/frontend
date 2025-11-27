import React from 'react';
import { ShieldAlert, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccessDeniedProps {
    title?: string;
    message?: string;
    requiredPermission?: string;
    showHomeButton?: boolean;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
    title = "Access Restricted",
    message = "Oops! It looks like you don't have permission to view this section.",
    requiredPermission,
    showHomeButton = true
}) => {
    const navigate = useNavigate();

    // Helper function to format permission keys to readable format
    const formatPermission = (permission: string) => {
        return permission
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-red-50 p-6 rounded-full mb-6 animate-bounce-slow">
                <ShieldAlert className="w-16 h-16 text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {title}
            </h2>

            <p className="text-gray-600 max-w-md mb-8 text-lg">
                {message}
            </p>

            {requiredPermission && (
                <div className="bg-gray-100 px-4 py-2 rounded-md mb-8 text-sm text-gray-500 font-mono">
                    Required permission: <span className="font-semibold text-gray-700">{formatPermission(requiredPermission)}</span>
                </div>
            )}

            {showHomeButton && (
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                    <Home className="w-5 h-5 mr-2" />
                    Return to Dashboard
                </button>
            )}
        </div>
    );
};

export default AccessDenied;

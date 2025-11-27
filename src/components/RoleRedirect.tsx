import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('RoleRedirect: user=', user, 'loading=', loading);
    if (!loading && user) {
      console.log('RoleRedirect: Redirecting based on role:', user.role);
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'business_owner':
          navigate('/business-owner/dashboard');
          break;
        case 'client':
          navigate('/client/dashboard');
          break;
        case 'staff':
          navigate('/staff/dashboard');
          break;
        default:
          // If user has an unrecognized role, redirect to login or show error
          navigate('/login');
      }
    }
  }, [user, loading, navigate]);

  // Show loading state while checking user role
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default RoleRedirect;
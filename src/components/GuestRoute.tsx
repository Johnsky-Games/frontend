import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface GuestRouteProps {
    children: React.ReactNode;
}

/**
 * GuestRoute - Protege rutas que solo deben ser accesibles por usuarios NO autenticados
 * Si el usuario está autenticado, lo redirige a su dashboard correspondiente
 */
const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();

    // Mostrar loading mientras se verifica la autenticación
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Si el usuario está autenticado, redirigir a su dashboard según rol
    if (user) {
        switch (user.role) {
            case 'admin':
                return <Navigate to="/admin/dashboard" replace />;
            case 'business_owner':
                return <Navigate to="/business-owner/dashboard" replace />;
            case 'staff':
                return <Navigate to="/staff/dashboard" replace />;
            case 'client':
                return <Navigate to="/client/dashboard" replace />;
            default:
                // Fallback genérico si el rol no coincide
                return <Navigate to="/dashboard" replace />;
        }
    }

    // Si NO está autenticado, permitir acceso a la ruta pública
    return <>{children}</>;
};

export default GuestRoute;

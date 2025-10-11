import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';

const ProtectedRoute = ({ children, adminRequired = false }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated()) {
        // Salva la location attuale per il redirect dopo il login
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (adminRequired && !user?.admin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;

// In src/components/ProtectedRoute.tsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ProtectedRoute: React.FC = () => {
    // --- THIS IS THE FIX ---
    // Instead of 'isAuthenticated', we check if the 'user' object exists.
    const { user } = useApp();

    // If a user object exists, they are logged in.
    // The <Outlet /> renders the nested child route (e.g., a dashboard).
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
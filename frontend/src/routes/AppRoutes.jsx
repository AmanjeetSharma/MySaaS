import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

// Public Pages
import { Home } from '@/pages/home/Home';

// Auth Pages
import Register from '@/pages/auth/Register';
import Verify from '@/pages/auth/Verify';
import Login from '@/pages/auth/Login';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// Protected Pages (create these files with basic structure)
import Dashboard from '@/pages/dashboard/Dashboard';

import Organization from '@/pages/organization/Organization';

export const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
                <Route path="/" element={<Home />} />

                {/* Auth Routes */}
                <Route path="/register" element={<Register />} />
                <Route path="/verify/:token" element={<Verify />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/organization" element={<Organization />} />

                </Route>
            </Route>
        </Routes>
    );
}
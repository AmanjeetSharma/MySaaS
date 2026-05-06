import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

// Public Pages
import Home from '@/pages/home/Home';

// Auth Pages
import Register from '@/pages/auth/Register';
import Verify from '@/pages/auth/Verify';
import Login from '@/pages/auth/Login';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// Protected Pages (create these files with basic structure)
import Dashboard from '@/pages/dashboard/Dashboard';

// Organization imports
import Organization from '@/pages/organization/Organization';

// Analytics imports
import AnalyticsBookings from '@/pages/analytics/AnalyticsBookings';
import AnalyticsCRM from '@/pages/analytics/AnalyticsCRM';
import AnalyticsConversion from '@/pages/analytics/AnalyticsConversion';


// Service imports
import AllServices from '@/pages/services/AllServices';
import CreateService from '@/pages/services/CreateService';
import Availability from '@/pages/services/Availability';

// Customer imports
import Customers from '@/pages/customers/Customers';

// Deals imports
import ActiveDeals from '@/pages/deals/ActiveDeals';
import WonDeals from '@/pages/deals/WonDeals';
import LostDeals from '@/pages/deals/LostDeals';

// Bookings imports
import Bookings from '@/pages/bookings/Bookings';

// Reminder imports
import Reminder from '@/pages/reminder/Reminder';

// Settings imports
import Settings from '@/pages/settings/Settings';
import Profile from '@/pages/settings/Profile';

// Contact imports
import Contact from '@/pages/public/Contact';


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

                    {/* Organization Route */}
                    <Route path="/organization" element={<Organization />} />

                    {/* Service Routes */}
                    <Route path="/services/all" element={<AllServices />} />
                    <Route path="/services/create" element={<CreateService />} />
                    <Route path="/services/availability" element={<Availability />} />

                    {/* Analytics Routes */}
                    <Route path="/analytics/bookings" element={<AnalyticsBookings />} />
                    <Route path="/analytics/crm" element={<AnalyticsCRM />} />
                    <Route path="/analytics/conversion" element={<AnalyticsConversion />} />

                    {/* Customer Routes */}
                    <Route path="/customers" element={<Customers />} />

                    {/* Deals Routes */}
                    <Route path="/deals/active" element={<ActiveDeals />} />
                    <Route path="/deals/won" element={<WonDeals />} />
                    <Route path="/deals/lost" element={<LostDeals />} />

                    {/* Bookings Route */}
                    <Route path="/bookings" element={<Bookings />} />

                    {/* Reminder Route */}
                    <Route path="/reminders" element={<Reminder />} />

                    {/* Settings Route */}
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/settings/profile" element={<Profile />} />

                    {/* Contact Route */}
                    <Route path="/support" element={<Contact />} />
                </Route>
            </Route>
        </Routes>
    );
}
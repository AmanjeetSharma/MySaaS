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

import Dashboard from '@/pages/dashboard/Dashboard';

// Organization imports
import Organizations from '@/pages/organization/Organizations';
import OrganizationDetails from '@/pages/organization/OrganizationDetails';
import Members from '@/pages/organization/Members';

// Analytics imports
import AnalyticsBookings from '@/pages/analytics/AnalyticsBookings';
import AnalyticsCRM from '@/pages/analytics/AnalyticsCRM';
import AnalyticsConversion from '@/pages/analytics/AnalyticsConversion';


// Service imports
import AllServices from '@/pages/organization/services/allServices/AllServices';
import Availability from '@/pages/organization/services/Availability';

// Customer imports
import Customers from '@/pages/crm/customers/Customers';
import CustomerDetails from '@/pages/crm/customers/CustomerDetails';
import CustomerTimeline from '@/pages/crm/customers/CustomerTimeline';

// Deals imports
import Deals from '@/pages/crm/deals/Deals';
import DealDetails from '@/pages/crm/deals/DealDetails';

// Bookings imports
import Bookings from '@/pages/bookings/Bookings';

// Reminder imports
import Reminder from '@/pages/reminder/Reminder';

// Settings imports
import Profile from '@/pages/settings/account/Profile';
import Appearance from '@/pages/settings/system/Appearance';
import Preferences from '@/pages/settings/system/Preferences';
import Security from '@/pages/settings/account/Security';
import ChangePassword from '@/pages/settings/account/ChangePassword';

// Integrations imports
import GoogleCalendar from '@/pages/organization/integrations/GoogleCalendar';
import WhatsApp from '@/pages/organization/integrations/WhatsApp';

// Notifications imports
import Notifications from '@/pages/notifications/Notifications';

// Contact imports
import Contact from '@/pages/public/Contact';

// Not Found Page
import NotFound from '@/pages/NotFound';


export const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
                <Route path="/" element={<Home />} />

                {/* Auth Routes */}
                <Route path="/signup" element={<Register />} />
                <Route path="/verify/:token" element={<Verify />} />
                <Route path="/signin" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Organization Route */}
                    <Route path="/organizations" element={<Organizations />} />
                    <Route path="/organizations/:orgId" element={<OrganizationDetails />} />
                    <Route path="/organizations/:orgId/members" element={<Members />} />

                    {/* Service Routes */}
                    <Route path="/services/all" element={<AllServices />} />
                    <Route path="/services/all/:serviceId/availability" element={<Availability />} />

                    {/* Analytics Routes */}
                    <Route path="/analytics/bookings" element={<AnalyticsBookings />} />
                    <Route path="/analytics/crm" element={<AnalyticsCRM />} />
                    <Route path="/analytics/conversion" element={<AnalyticsConversion />} />

                    {/* Customer Routes */}
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/customers/:customerId" element={<CustomerDetails />} />
                    <Route path="/customers/:customerId/timeline" element={<CustomerTimeline />} />

                    {/* Deals Routes */}
                    <Route path="/deals" element={<Deals />} />
                    <Route path="/deals/:dealId" element={<DealDetails />} />

                    {/* Bookings Route */}
                    <Route path="/bookings" element={<Bookings />} />

                    {/* Integrations Routes */}
                    <Route path="/integrations/google-calendar" element={<GoogleCalendar />} />
                    <Route path="/integrations/whatsapp" element={<WhatsApp />} />

                    {/* Reminder Route */}
                    <Route path="/reminders" element={<Reminder />} />

                    {/* Settings Route */}
                    <Route path="/settings/account/profile" element={<Profile />} />
                    <Route path="/settings/system/appearance" element={<Appearance />} />
                    <Route path="/settings/system/preferences" element={<Preferences />} />
                    <Route path="/settings/account/security" element={<Security />} />
                    <Route path="/settings/account/change-password" element={<ChangePassword />} />

                    {/* Notifications Route */}
                    <Route path="/notifications" element={<Notifications />} />

                    {/* Contact Route */}
                    <Route path="/support" element={<Contact />} />

                    {/* Catch-all for 404 Not Found */}
                    <Route path="*" element={<NotFound />} />

                </Route>
            </Route>
        </Routes>
    );
};

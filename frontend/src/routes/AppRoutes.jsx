import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';

// Route Guards
import { ProtectedRoute } from './routeGuard/ProtectedRoute';
import { PublicRoute } from './routeGuard/PublicRoute';
import { ChangePasswordRouteGuard } from './routeGuard/ChangePasswordRouteGuard';
import { SetPasswordRouteGuard } from './routeGuard/SetPasswordRouteGuard';

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

// Service imports
import Services from '@/pages/organization/services/allServices/Services';
import Availability from '@/pages/organization/services/availability/Availability';
import ServiceDetails from '@/pages/organization/services/ServiceDetails';

// Public Service imports
import PublicService from '@/pages/organization/services/publicService/PublicService';

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
import Profile from '@/pages/settings/account/profile/Profile';
import Appearance from '@/pages/settings/system/Appearance';
import Preferences from '@/pages/settings/system/Preferences';
import Security from '@/pages/settings/account/Security';
import ChangePassword from '@/pages/settings/account/ChangePassword';
import SetPassword from '@/pages/settings/account/SetPassword';

// Integrations imports
import ConnectGoogle from '@/pages/organization/integrations/ConnectGoogle';
import WhatsApp from '@/pages/organization/integrations/WhatsApp';
import Zoom from '@/pages/organization/integrations/Zoom';
import MicrosoftTeams from '@/pages/organization/integrations/MicrosoftTeams';

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
                    <Route path="/organizations/:orgId/services" element={<Services />} />
                    <Route path="/organizations/:orgId/services/:serviceId" element={<ServiceDetails />} />
                    <Route path="/services/all/:serviceId/availability" element={<Availability />} />

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
                    <Route path="/integrations/connect-google" element={<ConnectGoogle />} />
                    <Route path="/integrations/connect-whatsapp" element={<WhatsApp />} />
                    <Route path="/integrations/connect-zoom" element={<Zoom />} />
                    <Route path="/integrations/connect-microsoft-teams" element={<MicrosoftTeams />} />

                    {/* Reminder Route */}
                    <Route path="/reminders" element={<Reminder />} />

                    {/* Settings Route */}
                    <Route path="/settings/account/profile" element={<Profile />} />
                    <Route path="/settings/system/appearance" element={<Appearance />} />
                    <Route path="/settings/system/preferences" element={<Preferences />} />
                    <Route path="/settings/account/security" element={<Security />} />

                    <Route element={<ChangePasswordRouteGuard />}>
                        <Route path="/settings/account/change-password" element={<ChangePassword />} />
                    </Route>

                    <Route element={<SetPasswordRouteGuard />}>
                        <Route path="/settings/account/set-password" element={<SetPassword />} />
                    </Route>

                    {/* Notifications Route */}
                    <Route path="/notifications" element={<Notifications />} />

                    {/* Contact Route */}
                    <Route path="/support" element={<Contact />} />

                    {/* Catch-all for 404 Not Found */}
                    <Route path="*" element={<NotFound />} />

                </Route>
            </Route>

            {/* Public Service Route */}
            <Route path="/book/:orgSlug/:serviceSlug" element={<PublicService />} />

        </Routes>
    );
};

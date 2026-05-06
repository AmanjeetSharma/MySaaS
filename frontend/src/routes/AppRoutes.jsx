import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

// Public Pages
import { Home } from '@/pages/home/Home';

// Auth Pages
import { Register } from '@/pages/auth/Register';
import { Verify } from '@/pages/auth/Verify';
import { Login } from '@/pages/auth/Login';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';

// Protected Pages (create these files with basic structure)
import { Dashboard } from '@/pages/dashboard/Dashboard';
// import { Customers } from '@/pages/Customers';
// import { CustomerDetails } from '@/pages/CustomerDetails';
// import { DealsActive } from '@/pages/DealsActive';
// import { DealsWon } from '@/pages/DealsWon';
// import { DealsLost } from '@/pages/DealsLost';
// import { RemindersUpcoming } from '@/pages/RemindersUpcoming';
// import { RemindersOverdue } from '@/pages/RemindersOverdue';
// import { RemindersCompleted } from '@/pages/RemindersCompleted';
// import { Timeline } from '@/pages/Timeline';
// import { BookingsUpcoming } from '@/pages/BookingsUpcoming';
// import { BookingsCompleted } from '@/pages/BookingsCompleted';
// import { BookingsCalendar } from '@/pages/BookingsCalendar';
// import { Services } from '@/pages/Services';
// import { CreateService } from '@/pages/CreateService';
// import { AvailabilitySlots } from '@/pages/AvailabilitySlots';
// import { OrganizationSettings } from '@/pages/OrganizationSettings';
// import { Members } from '@/pages/Members';
// import { Invitations } from '@/pages/Invitations';
// import { Integrations } from '@/pages/Integrations';
// import { Billing } from '@/pages/Billing';
// import { AnalyticsCRM } from '@/pages/AnalyticsCRM';
// import { AnalyticsBookings } from '@/pages/AnalyticsBookings';
// import { AnalyticsConversion } from '@/pages/AnalyticsConversion';
// import { AccountSettings } from '@/pages/AccountSettings';
// import { ThemePreferences } from '@/pages/ThemePreferences';
// import { NotificationPreferences } from '@/pages/NotificationPreferences';
// import { Support } from '@/pages/Support';

export function AppRoutes() {
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

                    {/* Customers */}
                    {/* <Route path="/customers" element={<Customers />} />
                    <Route path="/customers/details" element={<CustomerDetails />} /> */}

                    {/* Deals */}
                    {/* <Route path="/deals/active" element={<DealsActive />} />
                    <Route path="/deals/won" element={<DealsWon />} />
                    <Route path="/deals/lost" element={<DealsLost />} /> */}

                    {/* Reminders */}
                    {/* <Route path="/reminders/upcoming" element={<RemindersUpcoming />} />
                    <Route path="/reminders/overdue" element={<RemindersOverdue />} />
                    <Route path="/reminders/completed" element={<RemindersCompleted />} /> */}

                    {/* Timeline */}
                    {/* <Route path="/timeline" element={<Timeline />} /> */}

                    {/* Bookings */}
                    {/* <Route path="/bookings/upcoming" element={<BookingsUpcoming />} />
                    <Route path="/bookings/completed" element={<BookingsCompleted />} />
                    <Route path="/bookings/calendar" element={<BookingsCalendar />} /> */}

                    {/* Services */}
                    {/* <Route path="/services" element={<Services />} />
                    <Route path="/services/create" element={<CreateService />} />
                    <Route path="/services/availability" element={<AvailabilitySlots />} /> */}

                    {/* Organization */}
                    {/* <Route path="/organization/settings" element={<OrganizationSettings />} />
                    <Route path="/organization/members" element={<Members />} />
                    <Route path="/organization/invitations" element={<Invitations />} />
                    <Route path="/organization/integrations" element={<Integrations />} />
                    <Route path="/organization/billing" element={<Billing />} /> */}

                    {/* Analytics */}
                    {/* <Route path="/analytics/crm" element={<AnalyticsCRM />} />
                    <Route path="/analytics/bookings" element={<AnalyticsBookings />} />
                    <Route path="/analytics/conversion" element={<AnalyticsConversion />} /> */}

                    {/* Profile */}
                    {/* <Route path="/profile/account" element={<AccountSettings />} />
                    <Route path="/profile/theme" element={<ThemePreferences />} />
                    <Route path="/profile/notifications" element={<NotificationPreferences />} /> */}

                    {/* Support */}
                    {/* <Route path="/support" element={<Support />} /> */}
                </Route>
            </Route>
        </Routes>
    );
}
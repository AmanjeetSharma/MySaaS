import {
    LayoutDashboard,
    Users,
    Briefcase,
    Calendar,
    Bell,
    FileText,
    BookOpen,
    Settings,
    BarChart3,
    UserCircle,
    LifeBuoy,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2,
    Star,
    AlertCircle
} from 'lucide-react';

export const navigationConfig = {
    mainNav: [
        {
            title: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
            items: []
        },
        {
            title: "Organization",
            href: "/organization",
            icon: Settings,
            items: []
        },
        {
            title: "Services",
            icon: BookOpen,
            items: [
                {
                    title: "All Services",
                    href: "/services",
                },
                {
                    title: "Create Service",
                    href: "/services/create",
                },
                {
                    title: "Availability / Slots",
                    href: "/services/availability",
                }
            ]
        },
        {
            title: "Customers",
            icon: Users,
            items: []
        },
        {
            title: "Deals",
            icon: Briefcase,
            items: [
                {
                    title: "Active Deals",
                    href: "/deals/active",
                    icon: TrendingUp
                },
                {
                    title: "Won Deals",
                    href: "/deals/won",
                    icon: Star
                },
                {
                    title: "Lost Deals",
                    href: "/deals/lost",
                    icon: TrendingDown
                }
            ]
        },
        {
            title: "Reminders",
            icon: Bell,
            items: []
        },
        {
            title: "Bookings",
            icon: Calendar,
            items: []
        },
        {
            title: "Analytics",
            icon: BarChart3,
            items: [
                {
                    title: "CRM Stats",
                    href: "/analytics/crm",
                },
                {
                    title: "Booking Stats",
                    href: "/analytics/bookings",
                },
                {
                    title: "Conversion Stats",
                    href: "/analytics/conversion",
                }
            ]
        },
        {
            title: "Profile / Preferences",
            icon: UserCircle,
            items: [
                {
                    title: "Account Settings",
                    href: "/profile/account",
                },
                {
                    title: "Theme Preferences",
                    href: "/profile/theme",
                },
                {
                    title: "Notifications",
                    href: "/profile/notifications",
                }
            ]
        },
        {
            title: "Help / Support",
            href: "/support",
            icon: LifeBuoy,
            items: []
        }
    ]
};
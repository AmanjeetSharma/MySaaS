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
            title: "Customers",
            icon: Users,
            items: [
                {
                    title: "All Customers",
                    href: "/customers",
                },
                {
                    title: "Customer Details",
                    href: "/customers/details",
                }
            ]
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
            items: [
                {
                    title: "Upcoming",
                    href: "/reminders/upcoming",
                    icon: Clock
                },
                {
                    title: "Overdue",
                    href: "/reminders/overdue",
                    icon: AlertCircle
                },
                {
                    title: "Completed",
                    href: "/reminders/completed",
                    icon: CheckCircle2
                }
            ]
        },
        {
            title: "Notes / Timeline",
            href: "/timeline",
            icon: FileText,
            items: []
        },
        {
            title: "Bookings",
            icon: Calendar,
            items: [
                {
                    title: "Upcoming Bookings",
                    href: "/bookings/upcoming",
                },
                {
                    title: "Completed Bookings",
                    href: "/bookings/completed",
                },
                {
                    title: "Booking Calendar",
                    href: "/bookings/calendar",
                }
            ]
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
            title: "Organization",
            icon: Settings,
            items: [
                {
                    title: "General Settings",
                    href: "/organization/settings",
                },
                {
                    title: "Members",
                    href: "/organization/members",
                },
                {
                    title: "Invitations",
                    href: "/organization/invitations",
                },
                {
                    title: "Integrations",
                    href: "/organization/integrations",
                },
                {
                    title: "Billing / Subscription",
                    href: "/organization/billing",
                }
            ]
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
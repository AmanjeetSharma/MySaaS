import {
    LayoutDashboard,
    Users,
    Briefcase,
    Clock,
    Shield,
    CheckCircle2,
    Star,
    Building2,
    Palette,
    Sliders,
    Settings,
    UserCircle,
    TrendingUp,
    TrendingDown,
    UserStar,
    Bell,
    Info,
    Plug,
    CalendarDays,
    MessageCircle,
    BookOpen,
    Handshake,
    CircleQuestionMark
} from 'lucide-react';

import { useUserStore } from '@/stores/userStore';
// import { useOrganizationStore } from '@/stores/organizationStore';

export const useNavigationConfig = () => {

    const activeOrganization = useUserStore(
        (state) => state.userProfile?.activeOrganization
    );

    // const currentOrganization = useOrganizationStore((state) => state.currentOrganization);

    return {
        mainNav: [
            {
                title: "Dashboard",
                href: "/dashboard",
                icon: LayoutDashboard,
                items: [],
                // Exact match paths
                exactMatch: true
            },
            {
                title: "Organization",
                icon: Building2,
                items: [
                    {
                        title: "Manage Organizations",
                        href: "/organizations",
                        icon: Building2,
                        exactMatch: true  // Only active on exact /organizations
                    },
                    {
                        title: "Organization Details",
                        href: activeOrganization
                            ? `/organizations/${activeOrganization}`
                            : "/organizations",
                        icon: Info,
                        // Active only on exact org details page, not sub-routes
                        pattern: '/organizations/:orgId'
                    },
                    {
                        title: "Members",
                        href: activeOrganization
                            ? `/organizations/${activeOrganization}/members`
                            : "/organizations",
                        icon: Users,
                        pattern: '/organizations/:orgId/members'
                    },
                ]
            },
            {
               title: "Services",
               href: "/services/all",
               icon: Briefcase,
               items: []
            },
            {
                title: "Customers",
                href: "/customers",
                icon: UserStar,
                items: []
            },
            {
                title: "Deals",
                icon: Handshake,
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
                title: "Bookings",
                href: "/bookings",
                icon: BookOpen,
                items: []
            },
            {
                title: "Integrations",
                icon: Plug,
                items: [
                    {
                        title: "Google Calendar",
                        href: "/integrations/google-calendar",
                        icon: CalendarDays
                    },
                    {
                        title: "WhatsApp",
                        href: "/integrations/whatsapp",
                        icon: MessageCircle
                    },
                ]
            },
            {
                title: "Notifications",
                href: "/notifications",
                icon: Bell,
                items: []
            },
            {
                title: "Support",
                href: "/support",
                icon: CircleQuestionMark,
                items: []
            },
            {
                title: "Settings",
                icon: Settings,
                items: [
                    {
                        title: "Manage Profile",
                        href: "/settings/account/profile",
                        icon: UserCircle
                    },
                    {
                        title: "Appearance",
                        href: "/settings/system/appearance",
                        icon: Palette
                    },
                    {
                        title: "Preferences",
                        href: "/settings/system/preferences",
                        icon: Sliders
                    },
                    {
                        title: "Security",
                        href: "/settings/account/security",
                        icon: Shield
                    },
                    {
                        title: "Change Password",
                        href: "/settings/account/change-password",
                        icon: CheckCircle2
                    }
                ]
            },
        ]
    };
};

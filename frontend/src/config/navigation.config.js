import {
    LayoutDashboard,
    Users,
    Briefcase,
    Clock,
    Shield,
    CheckCircle2,
    Star,
    SettingsIcon,
    AlertCircle,
    Building2,
    Palette,
    Sliders,
    Settings,
    UserCircle,
    LifeBuoy,
    TrendingUp,
    TrendingDown,
    BookOpen
} from 'lucide-react';

import { useUserStore } from '@/stores/userStore';

export const useNavigationConfig = () => {

    const activeOrganization = useUserStore(
        (state) => state.userProfile?.activeOrganization
    );

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
                        icon: SettingsIcon,
                        exactMatch: true  // Only active on exact /organizations
                    },
                    {
                        title: "Organization Details",
                        href: activeOrganization
                            ? `/organizations/${activeOrganization}`
                            : "/organizations",
                        icon: AlertCircle,
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
                icon: BookOpen,
                items: [
                    {
                        title: "All Services",
                        href: "/services/all",
                        icon: BookOpen
                    },
                    {
                        title: "Create Service",
                        href: "/services/create",
                        icon: SettingsIcon
                    },
                    {
                        title: "Availability / Slots",
                        href: "/services/availability",
                        icon: Clock
                    }
                ]
            },
            {
                title: "Customers",
                href: "/customers",
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
            {
                title: "Help / Support",
                href: "/support",
                icon: LifeBuoy,
                items: []
            }
        ]
    };
};

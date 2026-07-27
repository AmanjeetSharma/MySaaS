import {
    LayoutDashboard,
    Users,
    Briefcase,
    Shield,
    CheckCircle2,
    Building2,
    Palette,
    Sliders,
    Settings,
    UserCircle,
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

const getEntityId = (entity) => {
    if (!entity) return null;
    if (typeof entity === 'string') return entity;
    return entity._id || entity.id || null;
};

export const useNavigationConfig = () => {

    const activeOrganization = useUserStore(
        (state) => state.userProfile?.activeOrganization
    );
    const activeOrganizationId = getEntityId(activeOrganization);

    // const currentOrganization = useOrganizationStore((state) => state.currentOrganization);

    const userProfile = useUserStore((state) => state.userProfile);
    const isCredentialUser = userProfile?.providers.local?.enabled;

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
                        href: activeOrganizationId
                            ? `/organizations/${activeOrganizationId}`
                            : "/organizations",
                        icon: Info,
                        // Active only on exact org details page, not sub-routes
                        pattern: '/organizations/:orgId'
                    },
                    {
                        title: "Members",
                        href: activeOrganizationId
                            ? `/organizations/${activeOrganizationId}/members`
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
                href: "/deals",
                icon: Handshake,
                items: []
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
                    {
                        title: "Zoom",
                        href: "/integrations/zoom",
                        icon: MessageCircle
                    },
                    {
                        title: "Microsoft Teams",
                        href: "/integrations/microsoft-teams",
                        icon: MessageCircle
                    }
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
                    isCredentialUser
                        ?
                        {
                            title: "Change Password",
                            href: "/settings/account/change-password",
                            icon: CheckCircle2
                        } :
                        {
                            title: "Set Password",
                            href: "/settings/account/set-password",
                            icon: CheckCircle2
                        }
                ]
            },
        ]
    };
};

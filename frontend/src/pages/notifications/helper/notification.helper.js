import {
    Building2,
    Calendar,
    CreditCard,
    User,
    AtSign,
    ShieldAlert,
    Bell,
} from 'lucide-react';

/**
 * Maps notification event types to distinct, context-aware icons
 */
export const NOTIFICATION_TYPE_CONFIG = {
    organization_switched: {
        label: 'Organization Switched',
        icon: Building2,
    },
    booking_new: {
        label: 'New Booking',
        icon: Calendar,
    },
    payment: {
        label: 'Payment',
        icon: CreditCard,
    },
    customer: {
        label: 'Customer',
        icon: User,
    },
    mention: {
        label: 'Mention',
        icon: AtSign,
    },
    security: {
        label: 'Security',
        icon: ShieldAlert,
    },
    default: {
        label: 'Update',
        icon: Bell,
    },
};

export const getNotificationMeta = (type) => {
    return NOTIFICATION_TYPE_CONFIG[type] || NOTIFICATION_TYPE_CONFIG.default;
};

/**
 * Relative time formatter for scannable metadata
 */
export const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Filters list by the three requested tabs: 'all', 'unread', 'read'
 */
export const filterNotifications = (notifications, tab) => {
    if (!Array.isArray(notifications)) return [];
    switch (tab) {
        case 'unread':
            return notifications.filter((item) => !item.read);
        case 'read':
            return notifications.filter((item) => item.read);
        case 'all':
        default:
            return notifications;
    }
};
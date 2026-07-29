import {
    Video,
    CalendarDays,
    MessageCircle,
    Users,
} from "lucide-react";

export const INTEGRATION_CONFIG = {
    GOOGLE_MEET: {
        integrationKey: "google",
        name: "Google Meet",
        description: "Sync calendar & call links",
        icon: CalendarDays,
    },

    ZOOM: {
        integrationKey: "zoom",
        name: "Zoom",
        description: "Connect Zoom meetings",
        icon: Video,
    },

    MICROSOFT_TEAMS: {
        integrationKey: "microsoft",
        name: "Microsoft Teams",
        description: "Schedule Teams calls",
        icon: Users,
    },

    WHATSAPP: {
        integrationKey: "whatsapp",
        name: "WhatsApp",
        description: "Send automated messages",
        icon: MessageCircle,
    },
};

// Array export for rendering via .map()
export const INTEGRATION_LIST = Object.values(INTEGRATION_CONFIG);


// Utility function to find configuration by key (e.g. "google", "whatsapp")
export const getIntegrationByKey = (key) => {
    return INTEGRATION_LIST.find((item) => item.integrationKey === key) || null;
};
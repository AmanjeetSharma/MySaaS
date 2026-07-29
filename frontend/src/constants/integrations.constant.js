import { Video, VideoOff, Layers, MessageSquare } from 'lucide-react';

export const INTEGRATION_CONFIG = {
    GOOGLE_MEET: {
        integrationKey: "google",
        available: true,
        name: "Google Meet",
        description: "Sync calendar & call links",
        icon: Video,
    },

    ZOOM: {
        integrationKey: "zoom",
        available: false,
        name: "Zoom",
        description: "Connect Zoom meetings",
        icon: VideoOff,
    },

    MICROSOFT_TEAMS: {
        integrationKey: "microsoft",
        available: false,
        name: "Microsoft Teams",
        description: "Schedule Teams calls",
        icon: Layers,
    },

    WHATSAPP: {
        integrationKey: "whatsapp",
        available: false,
        name: "WhatsApp",
        description: "Send automated messages",
        icon: MessageSquare,
    },
};

// Array export for rendering via .map()
export const INTEGRATION_LIST = Object.values(INTEGRATION_CONFIG);


// Utility function to find configuration by key (e.g. "google", "whatsapp")
export const getIntegrationByKey = (key) => {
    return INTEGRATION_LIST.find((item) => item.integrationKey === key) || null;
};
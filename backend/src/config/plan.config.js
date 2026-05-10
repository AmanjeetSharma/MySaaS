export const PLAN_CONFIG = {
    free: {
        name: "Free",

        limits: {
            maxMembers: 3,
            maxCustomers: 50,
            aiCredits: 5,
        },

        features: {
            aiAssistance: false,
            googleCalendar: false,
        },
    },

    pro: {
        name: "Pro",

        limits: {
            maxMembers: 10,
            maxCustomers: 1000,
            aiCredits: 50,
        },

        features: {
            aiAssistance: false,
            googleCalendar: true,
        },
    },

    elite: {
        name: "Elite",

        limits: {
            maxMembers: 999,//avoiding using Infinity for safety in calculations
            maxCustomers: 99999,
            aiCredits: 500,
        },

        features: {
            aiAssistance: true,
            googleCalendar: true,
        },
    },
};
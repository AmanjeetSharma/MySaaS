export const PLAN_CONFIG = {
    free: {
        name: "Free",
        maxUsers: 1,
        maxCustomers: 50,
        aiCredits: 0,
        features: {
            aiAssistance: false,
            googleCalendar: false,
        },
    },

    pro: {
        name: "Pro",
        maxUsers: 5,
        maxCustomers: 1000,
        aiCredits: 50,
        features: {
            aiAssistance: false,
            googleCalendar: true,
        },
    },

    elite: {
        name: "Elite",
        maxUsers: 999, // avoid Infinity for safety
        maxCustomers: 10000,
        aiCredits: 500,
        features: {
            aiAssistance: true,
            googleCalendar: true,
        },
    },
};
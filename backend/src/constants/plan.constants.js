export const PLAN_LIMITS = {
    free: {
        name: "Free",
        limits: {
            maxMembers: 3,
            maxCustomers: 50,
            aiCredits: 5,
        },

        features: {
            aiAssistance: false,
            googleCalendar: true,
        },
    },

    pro: {
        name: "Pro",
        limits: {
            maxMembers: 10,
            maxCustomers: 1000,
            aiCredits: 100,
        },

        features: {
            aiAssistance: true,
            googleCalendar: true,
        },
    },

    // 

    // elite: {
    //     name: "Elite",

    //     limits: {
    //         maxMembers: 1000,//avoiding using Infinity for safety in calculations
    //         maxCustomers: 100000,
    //         aiCredits: 1000,
    //     },

    //     features: {
    //         aiAssistance: true,
    //         googleCalendar: true,
    //     },
    // },
};

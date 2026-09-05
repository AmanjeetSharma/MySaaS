const rateLimitConfig = {
    global: {
        key: (ip) => `rl:global:${ip}`,
        points: 100,
        duration: 60,
    },
    auth: {
        login: {
            key: (ip) => `rl:auth:login:${ip}`,
            points: 10,
            duration: 60,
            message: "You've made too many login attempts in a short period of time. Please wait until the cooldown ends before trying again.",
        },

        register: {
            key: (ip) => `rl:auth:register:${ip}`,
            points: 5,
            duration: 60,
            message: "You've made too many registration attempts in a short period of time. Please wait until the cooldown ends before trying again.",
        },

        verifyEmail: {
            key: (ip) => `rl:auth:verify-email:${ip}`,
            points: 10,
            duration: 60,
            message: "You've made too many email verification attempts in a short period of time. Please wait until the cooldown ends before trying again.",
        },

        googleLogin: {
            key: (ip) => `rl:auth:google-login:${ip}`,
            points: 10,
            duration: 60,
            message: "You've made too many Google login attempts in a short period of time. Please wait until the cooldown ends before trying again.",
        },

        refresh: {
            key: (ip) => `rl:auth:refresh:${ip}`,
            points: 20,
            duration: 60,
            message: "You've made too many token refresh attempts in a short period of time. Please wait until the cooldown ends before trying again.",
        },

        logout: {
            key: (ip) => `rl:auth:logout:${ip}`,
            points: 20,
            duration: 60,
            message: "You've made too many logout attempts in a short period of time. Please wait until the cooldown ends before trying again.",
        },
    },
};

export default rateLimitConfig;
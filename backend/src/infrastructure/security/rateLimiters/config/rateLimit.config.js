const rateLimitConfig = {
    global: {
        key: (ip) => `rl:global:${ip}`,
        points: 10,
        duration: 30,
    },
    auth: {
        login: {
            key: (ip) => `rl:auth:login:${ip}`,
            points: 10,
            duration: 60,
        },

        register: {
            key: (ip) => `rl:auth:register:${ip}`,
            points: 5,
            duration: 60,
        },

        verifyEmail: {
            key: (ip) => `rl:auth:verify-email:${ip}`,
            points: 10,
            duration: 60,
        },

        googleLogin: {
            key: (ip) => `rl:auth:google-login:${ip}`,
            points: 10,
            duration: 60,
        },

        refresh: {
            key: (ip) => `rl:auth:refresh:${ip}`,
            points: 20,
            duration: 60,
        },

        logout: {
            key: (ip) => `rl:auth:logout:${ip}`,
            points: 20,
            duration: 60,
        },
    },
};

export default rateLimitConfig;
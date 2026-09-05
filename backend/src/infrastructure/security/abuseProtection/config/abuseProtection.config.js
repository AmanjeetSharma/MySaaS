const abuseProtectionConfig = {
    login: {
        ip: {
            failures: 3,
            failureWindow: 10 * 60,
            blockDuration: 15 * 60,
            // failureWindow: 300,
            // blockDuration: 30,

            failureKey: (ip) => `abuse:auth:login:failures:ip:${ip}`,
            blockKey: (ip) => `abuse:auth:login:block:ip:${ip}`,
            message: "Too many failed login attempts. Please try again later. ip blocked.",
        },

        account: {
            failures: 3,
            failureWindow: 10 * 60, 
            blockDuration: 15 * 60,
            // failureWindow: 300,
            // blockDuration: 30,

            failureKey: (email) => `abuse:auth:login:failures:account:${email}`,
            blockKey: (email) => `abuse:auth:login:block:account:${email}`,
            message: "Too many failed login attempts. Please try again later. account blocked.",
        },
    },
};

export default abuseProtectionConfig;
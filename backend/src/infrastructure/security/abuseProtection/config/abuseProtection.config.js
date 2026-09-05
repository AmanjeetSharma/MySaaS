const abuseProtectionConfig = {
    login: {
        ip: {
            failures: 15,
            failureWindow: 10 * 60, // 10 minutes
            blockDuration: 15 * 60, // 15 minutes

            failureKey: (ip) => `abuse:auth:login:failures:ip:${ip}`,
            blockKey: (ip) => `abuse:auth:login:block:ip:${ip}`,
            message: "Too many failed login attempts. Please try again later. ip blocked.",
        },

        account: {
            failures: 15,
            failureWindow: 10 * 60, // 10 minutes
            blockDuration: 15 * 60, // 15 minutes

            failureKey: (email) => `abuse:auth:login:failures:account:${email}`,
            blockKey: (email) => `abuse:auth:login:block:account:${email}`,
            message: "Too many failed login attempts on this account. Please try again later.",
        },
    },
};

export default abuseProtectionConfig;
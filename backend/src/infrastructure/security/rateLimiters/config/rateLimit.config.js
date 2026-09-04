const rateLimitConfig = {
    global: {
        key: (ip) => `rl:global:${ip}`,
        points: 100,
        duration: 60,
    },
};

export default rateLimitConfig;
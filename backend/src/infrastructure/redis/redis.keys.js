const redisKeys = {
    rateLimit: {
        global: (ip)=> `rl:global:${ip}`,
    }
};

export default redisKeys;
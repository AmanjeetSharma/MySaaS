const redisKeys = {
    user: {
        profile: (userId) => `user:profile:${userId}`,
    }
};

export default redisKeys;
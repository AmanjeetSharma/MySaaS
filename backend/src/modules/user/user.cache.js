import redis from "#/infrastructure/redis/redis.client.js";
import redisKeys from "#/infrastructure/redis/redis.keys.js";
import redisTtl from "#/infrastructure/redis/redis.ttl.js";
import logger from "#/config/logger.js";


export const getUserProfileCache = async (userId) => {
    try {
        const cachedUser = await redis.get(redisKeys.user.profile(userId));

        if (!cachedUser) {
            return null;
        }

        return JSON.parse(cachedUser);
    } catch (err) {
        logger.warn(
            { err },
            "user.profile_cache.read_failed"
        );

        return null;
    }
};


export const setUserProfileCache = async (userId, profile) => {
    try {
        await redis.set(redisKeys.user.profile(userId), JSON.stringify(profile), "EX", redisTtl.user.profile);
    } catch (err) {
        logger.warn(
            { err },
            "user.profile_cache.write_failed"
        );
    }
};


export const invalidateUserProfileCache = async (userId) => {
    try {
        await redis.del(redisKeys.user.profile(userId));
    } catch (err) {
        logger.warn(
            { err },
            "user.profile_cache.invalidation_failed"
        );
    }
};
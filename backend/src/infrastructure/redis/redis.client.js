import Redis from "ioredis";
import env from "../../config/env.config.js";
import logger from "../../config/logger.js";

let redisShutdownHandler = null;

export const setRedisShutdownHandler = (handler) => {
    redisShutdownHandler = handler;
}

let isRedisShuttingDown = false;
let redisOutageStartedAt = null;
let redisOutageTimer = null;

const redis = new Redis(env.REDIS_URL, {
    lazyConnect: true,

    retryStrategy(times) {
        const delay = Math.min(100 * 2 ** (times - 1), 10000);
        // Exponential backoff with a maximum delay of 10 seconds
        // 100ms, 200ms, 400ms, 800ms, 1600ms, 3200ms, 6400ms, 10000ms (max)

        if (times <= 5 || times % 3 === 0) {
            logger.warn(
                { attempt: times, delay },
                "Retrying Redis connection"
            );
        }

        return delay;
    },

});



// redis.on("connect", () => {
//     logger.info("Redis connected successfully");
// });

redis.on("ready", () => {
    if (isRedisShuttingDown) return;

    if (redisOutageTimer) {
        clearTimeout(redisOutageTimer);
        redisOutageTimer = null;
    }

    redisOutageStartedAt = null;

    logger.info("Redis is ready");
});



redis.on("close", () => {
    if (isRedisShuttingDown) return;
    if (redisOutageStartedAt) return;

    redisOutageStartedAt = Date.now();

    redisOutageTimer = setTimeout(() => {
        const duration = Date.now() - redisOutageStartedAt;

        logger.fatal(
            { duration },
            "Redis has been unavailable for too long, shutdown initiated..."
        );

        if (redisShutdownHandler) {
            redisShutdownHandler("REDIS_OUTAGE", 1);
        }
    }, env.REDIS_MAX_OUTAGE_DURATION_MS);
});



let lastErrorLogTime = 0;

redis.on("error", (error) => {
    const now = Date.now();

    if (now - lastErrorLogTime > env.REDIS_ERROR_LOG_THROTTLE_MS) {
        lastErrorLogTime = now;

        logger.error(
            { err: error },
            "Redis connection error"
        );
    }
});


export const connectRedis = async () => {
    try {
        await redis.connect();
    } catch (error) {
        logger.fatal(
            { err: error },
            "Redis connection failed"
        );

        throw error;
    }
};

export const disconnectRedis = async () => {
    isRedisShuttingDown = true;

    if(redisOutageTimer) {
        clearTimeout(redisOutageTimer);
        redisOutageTimer = null;
    }

    redisOutageStartedAt = null;

    if (redis.status === "end") {
        return;
    }

    await redis.quit();
};



export default redis;

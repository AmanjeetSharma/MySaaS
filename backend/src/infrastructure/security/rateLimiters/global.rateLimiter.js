import { ApiResponse } from "../../../utils/ApiResponse.js";
import { RateLimiterRedis } from "rate-limiter-flexible";
import redis from "../../redis/redis.client.js";
import rateLimitConfig from "./config/rateLimit.config.js";
import logger from "../../../config/logger.js";


const globalRateLimiter = new RateLimiterRedis({
    storeClient: redis,

    points: rateLimitConfig.global.points,
    duration: rateLimitConfig.global.duration,

    execEvenly: false,
});


const globalRateLimiterMiddleware = async (req, res, next) => {
    console.log("Global rate limiter middleware triggered for IP:", req.ip);
    const key = rateLimitConfig.global.key(req.ip);

    try {
        await globalRateLimiter.consume(key);

        next();
    } catch (error) {
        if (error?.remainingPoints !== undefined) {
            const retryAfter = Math.ceil(error.msBeforeNext / 1000);

            res.set("Retry-After", String(retryAfter));

            return res.status(429).json(
                new ApiResponse(
                    429,
                    null,
                    "You've made too many requests in a short period of time. Please wait until the cooldown ends before trying again."
                )
            );
        }

        logger.error(
            {
                err: error,
                ip: req.ip,
                path: req.originalUrl,
            },
            "Global rate limiter Redis error"
        );

        // when Redis is down, allowing traffic to pass through
        next();
    }
};

export default globalRateLimiterMiddleware;
import { RateLimiterRedis } from "rate-limiter-flexible";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import redis from "../../redis/redis.client.js";
import rateLimitConfig from "./config/rateLimit.config.js";
import logger from "../../../config/logger.js";

const createAuthRateLimiter = (config) => {
    const limiter = new RateLimiterRedis({
        storeClient: redis,

        points: config.points,
        duration: config.duration,

        execEvenly: false,
    });

    return async (req, res, next) => {
        const key = config.key(req.ip);

        try {
            await limiter.consume(key);

            next();
        } catch (error) {
            if (error?.remainingPoints !== undefined) {
                const retryAfter = Math.ceil(error.msBeforeNext / 1000);

                logger.warn(
                    {
                        module: "auth-rate-limiter",
                        ip: req.ip,
                        path: req.originalUrl,
                        retryAfter: retryAfter,
                    },
                    "Rate limit exceeded"
                );

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
                    module: "auth-rate-limiter",
                    ip: req.ip,
                    path: req.originalUrl,
                    err: error,
                },
                "Auth rate limiter Redis error"
            );

            // when Redis is down, allowing traffic to pass through
            next();
        }
    };
};


export const loginRateLimiter = createAuthRateLimiter(rateLimitConfig.auth.login);
export const registerRateLimiter = createAuthRateLimiter(rateLimitConfig.auth.register);
export const verifyEmailRateLimiter = createAuthRateLimiter(rateLimitConfig.auth.verifyEmail);
export const googleLoginRateLimiter = createAuthRateLimiter(rateLimitConfig.auth.googleLogin);
export const refreshRateLimiter = createAuthRateLimiter(rateLimitConfig.auth.refresh);
export const logoutRateLimiter = createAuthRateLimiter(rateLimitConfig.auth.logout);
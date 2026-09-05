import { ApiResponse } from "../../../utils/ApiResponse.js";
import redis from "../../redis/redis.client.js";
import abuseProtectionConfig from "./config/abuseProtection.config.js";
import logger from "../../../config/logger.js";

const loginAbuseProtection = async (req, res, next) => {
    const ip = req.ip;

    const email = typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : null;

    const { ip: ipConfig, account: accountConfig } = abuseProtectionConfig.login;

    try {
        const ipBlockKey = ipConfig.blockKey(ip);

        const ipBlockTtl = await redis.ttl(ipBlockKey);

        if (ipBlockTtl > 0) {
            logger.warn(
                {
                    module: "login-abuse-protection",
                    ip,
                    retryAfter: ipBlockTtl,
                    reason: "ip-temporary-block",
                },
                "Login request blocked"
            );

            res.set("Retry-After", String(ipBlockTtl));

            return res.status(429).json(
                new ApiResponse(
                    429,
                    null,
                    ipConfig.message
                )
            );
        }

        if (email) {
            const accountBlockKey = accountConfig.blockKey(email);

            const accountBlockTtl = await redis.ttl(accountBlockKey);

            if (accountBlockTtl > 0) {
                logger.warn(
                    {
                        module: "login-abuse-protection",
                        ip,
                        retryAfter: accountBlockTtl,
                        reason: "account-temporary-block",
                    },
                    "Login request blocked"
                );

                res.set("Retry-After", String(accountBlockTtl));

                return res.status(429).json(
                    new ApiResponse(
                        429,
                        null,
                        accountConfig.message
                    )
                );
            }
        }

        next();

    } catch (error) {
        logger.error(
            {
                module: "login-abuse-protection",
                ip,
                err: error,
            },
            "Login abuse protection Redis error"
        );

        // when Redis is down, allowing traffic to pass through
        next();
    }
};

export default loginAbuseProtection;









export const recordLoginFailure = async (ip, email) => {
    const { ip: ipConfig, account: accountConfig } = abuseProtectionConfig.login;

    const ipFailureKey = ipConfig.failureKey(ip);
    const ipFailures = await redis.incr(ipFailureKey);

    if (ipFailures === 1) {
        await redis.expire(
            ipFailureKey,
            ipConfig.failureWindow // ttl 
        );
    }

    if (ipFailures >= ipConfig.failures) {
        const ipBlockKey = ipConfig.blockKey(ip);

        await redis.set(
            ipBlockKey,
            "1",
            "EX",
            ipConfig.blockDuration // ttl
        );
    }




    if (email) {
        const accountFailureKey = accountConfig.failureKey(email);
        const accountFailures = await redis.incr(accountFailureKey);

        if (accountFailures === 1) {
            await redis.expire(
                accountFailureKey,
                accountConfig.failureWindow // ttl
            );
        }

        if (accountFailures >= accountConfig.failures) {
            const accountBlockKey = accountConfig.blockKey(email);

            await redis.set(
                accountBlockKey,
                "1",
                "EX",
                accountConfig.blockDuration // ttl
            );
        }
    }
};
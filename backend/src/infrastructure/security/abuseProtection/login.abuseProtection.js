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
s
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
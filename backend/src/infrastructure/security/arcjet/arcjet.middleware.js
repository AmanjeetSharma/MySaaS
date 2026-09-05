import arcjetClient from "./arcjet.client.js";
import logger from "#/config/logger.js";

const arcjetMiddleware = async (req, res, next) => {
    try {
        const decision = await arcjetClient.protect(req);

        logger.info(
            {
                module: "arcjet",
                path: req.originalUrl,
                ip: req.ip,
                conclusion: decision.conclusion,
            },
            "Arcjet request evaluated"
        );

        if (decision.isDenied()) {
            logger.warn(
                {
                    module: "arcjet",
                    path: req.originalUrl,
                    ip: req.ip,
                    conclusion: decision.conclusion,
                },
                "Arcjet request denied"
            );

            return res.status(403).json({
                statusCode: 403,
                data: null,
                message: "Request blocked by security policy.",
                success: false,
            });
        }

        next();
    } catch (error) {
        logger.error(
            {
                module: "arcjet",
                path: req.originalUrl,
                ip: req.ip,
                err: error,
            },
            "Arcjet request evaluation failed"
        );

        // when Arcjet is unavailable, allowing traffic to pass through
        next();
    }
};

export default arcjetMiddleware;
import pinoHttp from "pino-http";
import logger from "../config/logger.js";
import env from "../config/env.config.js";

const isProduction = env.NODE_ENV === "production";

const httpLogger = pinoHttp({
    logger,

    customProps: () => ({
        type: "http"
    }),

    serializers: {
        req(req) {
            const request = {
                id: req.id,
                method: req.method,
                url: req.url,

            }
            if (isProduction) {
                request.ip = req.ip;
                request.userAgent = req.headers["user-agent"];
            }
            return request;
        },

        res(res) {
            return {
                statusCode: res.statusCode
            };
        }
    }
});

export default httpLogger;
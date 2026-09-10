import crypto from "crypto";
import pinoHttp from "pino-http";
import logger from "../config/logger.js";
import env from "../config/env.config.js";

const isProduction = env.NODE_ENV === "production";

const httpLogger = pinoHttp({
    logger,

    genReqId: () => crypto.randomUUID(),

    customProps: () => ({
        type: "http"
    }),

    autoLogging: {
        ignore: () => !isProduction
    },

    serializers: {
        req(req) {
            const request = {
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
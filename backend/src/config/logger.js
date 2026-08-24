import pino from "pino";
import env from "./env.config.js";

const isProduction = env.NODE_ENV === "production";

const logger = pino({

    level: env.LOG_LEVEL || (isProduction ? "info" : "debug"),

    // base is a set of default properties that will be included in every log message.
    // base: {
    //     service: env.SERVICE_NAME || "mysaas-api",
    //     environment: env.NODE_ENV || "development"
    // },

    // human readable timestamps in ISO format
    timestamp: pino.stdTimeFunctions.isoTime,

    // Redact sensitive information as a safety net if it is accidentally logged.
    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "req.headers['set-cookie']",
            // "req.headers.set-cookie",
            "password",
            "accessToken",
            "refreshToken",
            "token"
        ],
        censor: "[REDACTED]"
    },

    serializers: {
        err: pino.stdSerializers.err
    },

    ...(isProduction
        ? {}
        : {
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    colorizeObjects: true,
                    levelFirst: true,
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname"
                }
            }
        })
});

export default logger;


// Some notes on the logger configuration:
// trace  -> 10   least important
// debug  -> 20
// info   -> 30
// warn   -> 40
// error  -> 50
// fatal  -> 60   most important

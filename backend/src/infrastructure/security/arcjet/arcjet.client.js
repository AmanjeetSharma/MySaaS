import arcjet, { shield, detectBot } from "@arcjet/node";
import env from "#/config/env.config.js";
import arcjetConfig from "./config/arcjet.config.js";
import logger from "#/config/logger.js";

const arcjetClient = arcjet({
    key: env.ARCJET_API_KEY,

    rules: [
        shield({
            mode: arcjetConfig.shield.mode,
        }),

        // detectBot({
        //     mode: arcjetConfig.botDetection.mode,
        //     allow: arcjetConfig.botDetection.allow,
        // }),
    ],

    log: logger,
});

export default arcjetClient;
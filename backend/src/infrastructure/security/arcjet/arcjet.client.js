import arcjet, { shield, detectBot } from "@arcjet/node";
import env from "../../../config/env.config.js";
import arcjetConfig from "./config/arcjet.config.js";

const arcjetClient = arcjet({
    key: env.ARCJET_API_KEY,

    rules: [
        shield({
            mode: arcjetConfig.shield.mode,
        }),

        detectBot({
            mode: arcjetConfig.botDetection.mode,
            allow: arcjetConfig.botDetection.allow,
        }),
    ],
});

export default arcjetClient;
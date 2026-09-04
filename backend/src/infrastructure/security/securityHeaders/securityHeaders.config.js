import helmet from "helmet";
import env from "../../../config/env.config.js";

const isProduction = env.NODE_ENV === "production";

const securityHeaders = helmet({
    contentSecurityPolicy: false,

    crossOriginEmbedderPolicy: false,

    crossOriginOpenerPolicy: false,

    crossOriginResourcePolicy: false,

    hsts: isProduction
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
        }
        : false,

    referrerPolicy: {
        policy: "no-referrer",
    },
});

export default securityHeaders;
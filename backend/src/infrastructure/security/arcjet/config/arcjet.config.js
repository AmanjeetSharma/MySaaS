import env from "#/config/env.config.js";

const isProduction = env.NODE_ENV === "production";

const arcjetConfig = {
    shield: {
        mode: isProduction ? "LIVE" : "DRY_RUN",
    },

    botDetection: {
        mode: isProduction ? "LIVE" : "DRY_RUN",

        allow: [
            "CATEGORY:SEARCH_ENGINE",
        ],
    },
};

export default arcjetConfig;
import env from '#/config/env.config.js';

export const socketConfig = {
    cors: {
        origin: env.CORS_ORIGIN,
        credentials: true,
    },
};
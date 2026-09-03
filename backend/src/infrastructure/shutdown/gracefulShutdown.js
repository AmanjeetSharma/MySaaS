import mongoose from "mongoose";
import logger from "../../config/logger.js";
import { disconnectRedis } from "../redis/redis.client.js";
import env from "../../config/env.config.js";

let isShuttingDown = false;

export const gracefulShutdown = (server) => {
    const shutdown = async (signal) => {
        if (isShuttingDown) {
            logger.warn(
                "Shutdown already in progress..."
            );

            return;
        }

        isShuttingDown = true;

        logger.info(
            { signal },
            "Graceful shutdown initiated"
        );

        const forceShutdownTimer = setTimeout(() => {
            logger.fatal(
                "Graceful shutdown timed out. Forcing process exit."
            );
            process.exit(1);
        }, env.SERVER_SHUTDOWN_TIMEOUT_MS);

        try {
            await new Promise((resolve, reject) => {
                server.close((error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            logger.info("HTTP server closed");

            await disconnectRedis();
            logger.info("Redis connection closed");

            await mongoose.disconnect();
            logger.info("MongoDB connection closed");

            clearTimeout(forceShutdownTimer);

            logger.info("Graceful shutdown completed");

            process.exit(0);

        } catch (error) {

            clearTimeout(forceShutdownTimer);

            logger.fatal(
                { err: error },
                "Error during graceful shutdown"
            );

            process.exit(1);
        }
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
};
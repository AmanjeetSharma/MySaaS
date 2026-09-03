import mongoose from "mongoose";
import logger from "../../config/logger.js";
import env from "../../config/env.config.js";
import { disconnectRedis } from "../redis/redis.client.js";
import { stopJobs } from "../../jobs/index.js";

let isShuttingDown = false;

export const gracefulShutdown = (getServer) => {
    const shutdown = async (signal, exitCode = 0) => {
        if (isShuttingDown) {
            logger.warn("Shutdown already in progress...");

            return;
        }

        isShuttingDown = true;

        logger.info(
            { signal },
            "Graceful shutdown initiated"
        );

        const forceShutdownTimer = setTimeout(() => {
            logger.fatal("Graceful shutdown timed out. Forcibly exiting...");
            process.exit(1);
        }, env.SERVER_SHUTDOWN_TIMEOUT_MS);

        try {
            stopJobs();
            logger.info("Background jobs stopped");

            const server = getServer();

            await new Promise((resolve, reject) => {
                if (!server) {
                    resolve();
                    return;
                }

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
            logger.info(
                { service: "Redis" },
                "Connection closed"
            );

            await mongoose.disconnect();
            logger.info(
                { service: "MongoDB" },
                "MongoDB connection closed"
            );

            clearTimeout(forceShutdownTimer);

            logger.info("Graceful shutdown completed");

            process.exit(exitCode);

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

    return shutdown;
};
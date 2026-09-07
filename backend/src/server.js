import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";
import launchPage from "./config/launchPage.js"
import env from "./config/env.config.js";
import logger from "./config/logger.js";
import { connectRedis, setRedisShutdownHandler } from "./infrastructure/redis/redis.client.js";
import { gracefulShutdown } from "./infrastructure/shutdown/gracefulShutdown.js";
import { startQueues } from "#/infrastructure/queue/index.js";


dotenv.config({
    path: "./.env"
});

app.get("/", (req, res) => {
    res.send(launchPage('MySaaS'));
});

app.get("/health", (req, res) => {
    res.status(200).json({ status: "Server is healthy!" });
});


let server = null;

const shutdown = gracefulShutdown(() => server);

setRedisShutdownHandler(shutdown);

const startServer = async () => {
    try {
        await connectDB();

        await connectRedis();

        if (env.ENABLE_BACKGROUND_PROCESSING) {
            await startQueues();
            logger.info("Background processing started");
        } else {
            logger.warn("Background processing is disabled");
        }

        server = await new Promise((resolve, reject) => {
            const httpServer = app.listen(env.PORT, () => {
                resolve(httpServer);
            });

            httpServer.on("error", reject);
        });

        if (env.NODE_ENV === "development") {
            logger.info(`Server is live!`);
            logger.info(`Server is running on: http://localhost:${env.PORT}`);
            logger.info(`-------------------------------------------`);
        } else {
            logger.info(`Server is live!`);
            logger.info(`Server is running on port: ${env.PORT}`);
            logger.info(`-------------------------------------------`);
        }

    } catch (error) {
        logger.fatal(
            { err: error },
            "Server startup failed"
        );

        await shutdown("SERVER_STARTUP_FAILURE", 1);
    }
}

startServer();
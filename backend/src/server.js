import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";
import chalk from "chalk";
import launchPage from "./config/launchPage.js"
import env from "./config/env.config.js";
import logger from "./config/logger.js";
import { connectRedis, setRedisShutdownHandler } from "./infrastructure/redis/redis.client.js";
import { gracefulShutdown } from "./infrastructure/shutdown/gracefulShutdown.js";

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

        server = app.listen(env.PORT, () => {
            if (env.NODE_ENV === "development") {
                console.log(chalk.yellowBright(`Server is live!`));
                console.log(chalk.magentaBright(`🌐 Server is running on:`));
                console.log(chalk.cyanBright(`http://localhost:${env.PORT}`));
                console.log(chalk.gray(`-----------------------------------------`));
            } else {
                console.log(chalk.greenBright(`Production Server is live!`));
                console.log(chalk.cyanBright(`🌐 Port: ${env.PORT}`));
                console.log(chalk.gray(`-----------------------------------------`));
            }
        });
    } catch (error) {
        logger.fatal(
            { err: error },
            "Server startup failed"
        );

        await shutdown("SERVER_STARTUP_FAILURE", 1);
    }
}

startServer();
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";
import chalk from "chalk";
import launchPage from "./config/launchPage.js"
import env from "./config/env.config.js";
import { startJobs } from "./jobs/index.js";
import { connectRedis } from "./infrastructure/redis/redis.client.js";


dotenv.config({
    path: "./.env"
});

app.get("/", (req, res) => {
    res.send(launchPage('MySaaS'));
});

app.get("/health", (req, res) => {
    res.status(200).json({ status: "Server is healthy!" });
});

connectDB()
    .then(async () => {

        await connectRedis()

        app.listen(env.PORT, () => {
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

            if (env.ENABLE_JOBS) {
                startJobs(); // starting background jobs only after server goes live
            } else {
                console.log(chalk.yellowBright(`Background jobs are disabled.`));
            }

        });
    })

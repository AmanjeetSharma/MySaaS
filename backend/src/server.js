import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { app } from "./app.js";
import chalk from "chalk";
import launchPage from "./config/launchPage.js"
import env from "./config/env.js";
import { startJobs } from "./jobs/index.js";

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
    .then(() => {
        app.listen(env.PORT, () => {
            console.log(chalk.yellowBright(`Server is live!`));
            console.log(chalk.magentaBright(`🌐 Server is running on port:`));
            console.log(chalk.cyanBright(`http://localhost:${env.PORT}`));
            console.log(chalk.gray(`-----------------------------------------`));

            if (env.ENABLE_JOBS) {
                startJobs(); // Start background jobs only after server goes live
            }
        });
    })
    .catch((error) => {
        console.log("MongoDB Connection failed: ", error);
    });
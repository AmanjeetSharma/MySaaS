import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import { app } from "./src/app.js";
import chalk from "chalk";
import launchPage from "./src/config/launchPage.js"
import env from "./src/config/env.js";

// loading environment variables
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
            console.log(chalk.yellowBright(`Server is live! 🚀`));
            console.log(chalk.magentaBright(`🌐 Server is running on port:`));
            console.log(chalk.cyanBright(`http://localhost:${env.PORT}`));
            console.log(chalk.gray(`-----------------------------------------`));
        });
    })
    .catch((error) => {
        console.log("MongoDB Connection failed: ", error);
    });
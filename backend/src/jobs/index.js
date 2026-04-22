import cron from "node-cron";
import chalk from "chalk";
import { runPendingUserCleanup } from "./pendingUserCleanup.js";

export const startJobs = () => {
    console.log(`${chalk.blueBright("Starting background jobs...")}`);
    console.log(chalk.gray(`-----------------------------------------`));

    // every hour
    cron.schedule("0 * * * *", async () => {
        await runPendingUserCleanup();
    });
};
import cron from "node-cron";
import chalk from "chalk";
import { runPendingUserCleanup } from "./pendingUserCleanup.js";

export const startJobs = () => {
    console.log(`${chalk.blueBright("Starting background jobs...")}`);
    console.log(chalk.gray(`-----------------------------------------`));

    // every hour
    cron.schedule("*/5 * * * *", async () => { //runs every 5 minutes (env: development)
        await runPendingUserCleanup();
    });
};


// 1 hr cron.schedule("0 * * * *", async () => { // runs every hour at minute 0
// 5 min cron.schedule("*/5 * * * *", async () => { // runs every 5 minutes
// 30 sec cron.schedule("*/30 * * * * *", async () => { //runs every 30 seconds for testing (development phase)
import cron from "node-cron";
import chalk from "chalk";
import { runPendingUserCleanup } from "./pendingUserCleanup.js";
import { runInvitationCleanup } from "./invitationCleanup.js";
import { runExpiredBookingCleanup } from "./expiredBookingCleanup.js";

const scheduleJobs = [];
let jobsStarted = false;

export const startJobs = () => {
    if (jobsStarted) {
        console.log(chalk.yellowBright("Background jobs are already running."));
        return;
    }
    
    console.log(`${chalk.blueBright("Starting background jobs...")}`);
    console.log(chalk.gray(`-----------------------------------------`));
    
    jobsStarted = true;
    
    scheduleJobs.push(
        // every 30 minutes
        cron.schedule("*/30 * * * *", async () => {
            await runPendingUserCleanup();
        })
    );

    scheduleJobs.push(
        // every 30 minutes
        cron.schedule("*/30 * * * *", async () => {
            await runInvitationCleanup();
        })
    );

    scheduleJobs.push(
        // every 1 minute
        cron.schedule("* * * * *", async () => {
            await runExpiredBookingCleanup();
        })
    );
};


export const stopJobs = () => {
    scheduleJobs.forEach((job) => {
        job.stop();
    });
    jobsStarted = false;
    scheduleJobs.length = 0; // Clearing the array
};

// 1 hr cron.schedule("0 * * * *", async () => { // runs every hour at minute 0
// 5 min cron.schedule("*/5 * * * *", async () => { // runs every 5 minutes
// 30 sec cron.schedule("*/10 * * * * *", async () => { //runs every 10 seconds for testing (development phase)
// 3 hr cron.schedule("0 */3 * * *", async () => { // runs every 3 hours at minute 0
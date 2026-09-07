import { Worker } from "bullmq";
import { bullMQConnection } from "#/infrastructure/queue/bullmq/connection.js";
import { QUEUE_NAMES, CLEANUP_JOB_NAMES, } from "#/infrastructure/queue/queue.constants.js";
import { processPendingUserCleanup } from "#/infrastructure/queue/processors/cleanup/pendingUserCleanup.processor.js";
import { processExpiredBookingCleanup } from "#/infrastructure/queue/processors/cleanup/expiredBookingCleanup.processor.js";
import logger from "#/config/logger.js";


let cleanupWorker = null;


export const startCleanupWorker = () => {
    if (cleanupWorker) {
        return;
    }

    cleanupWorker = new Worker(QUEUE_NAMES.CLEANUP, async (job) => {
        switch (job.name) {

            case CLEANUP_JOB_NAMES.PENDING_USER_CLEANUP:
                return await processPendingUserCleanup();

            case CLEANUP_JOB_NAMES.EXPIRED_BOOKING_CLEANUP:
                return await processExpiredBookingCleanup();

            default:
                throw new Error(`Unknown cleanup job: ${job.name}`);
        }
    },

        {
            connection: bullMQConnection,
        }
    );


    // cleanupWorker.on("completed", (job) => { //this can flood the logs, so uncomment if needed
    //     logger.info(
    //         {
    //             jobId: job.id,
    //             jobName: job.name,
    //         },
    //         "Cleanup job completed"
    //     );
    // });


    cleanupWorker.on("failed", (job, error) => {
        logger.error(
            {
                jobId: job?.id,
                jobName: job?.name,
                err: error,
            },
            "Cleanup job failed"
        );
    });


    cleanupWorker.on("error", (error) => {
        logger.error(
            {
                err: error,
            },
            "Cleanup worker error"
        );
    });
};


export const stopCleanupWorker = async () => {
    if (!cleanupWorker) {
        return;
    }

    await cleanupWorker.close();

    cleanupWorker = null;
};
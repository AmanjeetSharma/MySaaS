import { Worker } from "bullmq";
import { bullMQConnection } from "#/infrastructure/queue/bullmq/connection.js";
import { QUEUE_NAMES, CLEANUP_JOB_NAMES, } from "#/infrastructure/queue/queue.constants.js";
import { processPendingUserCleanup } from "#/infrastructure/queue/processors/cleanup/pendingUserCleanup.processor.js";
import { processExpiredBookingCleanup } from "#/infrastructure/queue/processors/cleanup/expiredBookingCleanup.processor.js";
import logger from "#/config/logger.js";

export const cleanupWorker = new Worker(QUEUE_NAMES.CLEANUP, async (job) => {
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


cleanupWorker.on("completed", (job) => {
    logger.info(
        {
            jobId: job.id,
            jobName: job.name,
        },
        "cleanup.job.completed"
    );
});


cleanupWorker.on("failed", (job, error) => {
    logger.error(
        {
            jobId: job?.id,
            jobName: job?.name,
            err: error,
        },
        "cleanup.job.failed"
    );
});


cleanupWorker.on("error", (error) => {
    logger.error(
        {
            err: error,
        },
        "cleanup.worker.error"
    );
});
import { cleanupQueue } from "#/infrastructure/queue/queues/cleanup.queue.js";
import { CLEANUP_JOB_NAMES, } from "#/infrastructure/queue/queue.constants.js";


export const startCleanupSchedulers = async () => {

    await cleanupQueue.upsertJobScheduler(
        "pending-user-cleanup-scheduler",
        {
            every: 30 * 60 * 1000, // every 30 minutes
        },
        {
            name: CLEANUP_JOB_NAMES.PENDING_USER_CLEANUP,
            data: {},
            opts: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            },
        }
    );


    await cleanupQueue.upsertJobScheduler(
        "expired-booking-cleanup-scheduler",
        {
            every: 60 * 1000, // every 1 minute
        },
        {
            name: CLEANUP_JOB_NAMES.EXPIRED_BOOKING_CLEANUP,
            data: {},
            opts: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            },
        }
    );
};
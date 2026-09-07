import { startCleanupWorker, stopCleanupWorker, } from "#/infrastructure/queue/workers/cleanup.worker.js";
import { startCleanupSchedulers } from "#/infrastructure/queue/schedulers/cleanup.scheduler.js";
import { cleanupQueue } from "#/infrastructure/queue/queues/cleanup.queue.js";

let queuesStarted = false;


export const startQueues = async () => {
    if (queuesStarted) {
        return;
    }

    startCleanupWorker();

    await startCleanupSchedulers();

    queuesStarted = true;
};


export const stopQueues = async () => {
    if (!queuesStarted) {
        return;
    }

    await stopCleanupWorker();

    await cleanupQueue.close();

    queuesStarted = false;
};
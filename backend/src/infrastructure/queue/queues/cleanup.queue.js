import { Queue } from "bullmq";
import { bullMQConnection } from "#/infrastructure/queue/bullmq/connection.js";
import { QUEUE_NAMES } from "#/infrastructure/queue/queue.constants.js";

export const cleanupQueue = new Queue(
    QUEUE_NAMES.CLEANUP,
    {
        connection: bullMQConnection,
    }
);

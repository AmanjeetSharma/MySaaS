import { createNotificationRepository } from "./notification.repository.js";
import { emitNotificationToUser } from "#/infrastructure/websocket/emitters/notification.emitter.js";


export const buildNotification = ({
    type,
    title,
    message,
    data = {},
}) => {
    return {
        type,
        title,
        message,
        data,
        read: false,
    };
};


export const createNotification = async ({
    userId,
    organizationId,
    notification,
}) => {
    const createdNotification = await createNotificationRepository({
        userId,
        organizationId,
        notification,
    });

    emitNotificationToUser(userId, createdNotification);

    return createdNotification;
};
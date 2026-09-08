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


export const getOrganizationNotificationRecipients = (organization) => {
    if (!organization) {
        return [];
    }

    const userIds = [
        organization.owner,
        ...(organization.members ?? []).map((member) => member.user),
    ];

    return [
        ...new Map(
            userIds
                .filter(Boolean)
                .map((userId) => [
                    userId.toString(),
                    userId,
                ])
        ).values(),
    ];
};
import { Notification } from "./notification.model.js";


export const createNotificationRepository = async ({
    userId,
    organizationId,
    notification,
}) => {
    return Notification.create({
        user: userId,
        organization: organizationId,
        ...notification,
    });
}


export const findNotifications = async ({
    userId,
    limit,
    cursor,
}) => {
    const query = {
        user: userId,
    };

    if (cursor) {
        query.$or = [
            {
                createdAt: { $lt: cursor.createdAt },
            },
            {
                createdAt: cursor.createdAt,
                _id: { $lt: cursor._id },
            },
        ];
    }

    return Notification.find(query)
        .sort({
            createdAt: -1,
            _id: -1,
        })
        .limit(limit + 1);
};


export const markNotificationsAsReadRepository = async ({
    userId,
    notificationIds,
}) => {
    return Notification.updateMany(
        {
            _id: { $in: notificationIds },
            user: userId,
            read: false,
        },
        {
            $set: {
                read: true,
                readAt: new Date(),
            },
        }
    );
};


export const markAllNotificationsAsReadRepository = async (userId) => {
    return Notification.updateMany(
        {
            user: userId,
            read: false,
        },
        {
            $set: {
                read: true,
                readAt: new Date(),
            },
        }
    );
};


export const deleteSelectedNotificationsRepository = async ({
    userId,
    notificationIds,
}) => {
    return Notification.deleteMany({
        _id: { $in: notificationIds },
        user: userId,
    });
};


export const deleteAllNotificationsRepository = async (userId) => {
    return Notification.deleteMany({
        user: userId,
    });
};
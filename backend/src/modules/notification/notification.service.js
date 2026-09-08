import logger from "#/config/logger.js";
import {
    encodeCursor,
    decodeCursor,
} from "../../utils/cursor.js";
import {
    findNotifications,
    markNotificationsAsReadRepository,
    markAllNotificationsAsReadRepository,
    deleteSelectedNotificationsRepository,
    deleteAllNotificationsRepository,
    findAllNotificationsCountRepository,
    findUnreadNotificationsCountRepository,
} from "./notification.repository.js";
import {
    emitNotificationsRead,
    emitNotificationsDeleted,
    emitAllNotificationsRead,
    emitAllNotificationsDeleted
} from "../../infrastructure/websocket/emitters/notification.emitter.js";










const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

export const getNotificationsService = async ({
    userId,
    limit = DEFAULT_LIMIT,
    cursor = null,
}) => {
    const parsedLimit = Math.min(
        Math.max(Number(limit) || DEFAULT_LIMIT, 1),
        MAX_LIMIT
    );

    const decodedCursor = cursor
        ? decodeCursor(cursor)
        : null;

    const [notifications, all, unread] = await Promise.all([
        findNotifications({
            userId,
            limit: parsedLimit + 1,
            cursor: decodedCursor,
        }),

        findAllNotificationsCountRepository(userId),

        findUnreadNotificationsCountRepository(userId),
    ])

    const hasNextPage = notifications.length > parsedLimit;

    const results = hasNextPage
        ? notifications.slice(0, parsedLimit)
        : notifications;

    const lastNotification = results.at(-1);

    const nextCursor = hasNextPage && lastNotification
        ? encodeCursor({
            createdAt: lastNotification.createdAt,
            _id: lastNotification._id.toString(),
        })
        : null;

    const read = all - unread;

    logger.info(
        {
            userId,
            limit: parsedLimit,
            cursor: decodedCursor,
            nextCursor,
            counts: {
                all,
                unread,
                read,
            },
        },
        'notification.all.retrieved'
    );

    return {
        notifications: results,
        nextCursor,
        hasNextPage,

        counts: {
            all,
            unread,
            read,
        },
    };
};










export const markSelectedNotificationsAsReadService = async ({
    userId,
    notificationIds,
}) => {
    const result = await markNotificationsAsReadRepository({
        userId,
        notificationIds,
    });

    if (result.modifiedCount > 0) {
        emitNotificationsRead(userId, notificationIds);
    }

    logger.info(
        {
            userId,
            notificationIds,
            modifiedCount: result.modifiedCount,
        },
        "notification.selected.markedAsRead",
    );

    return {
        modifiedCount: result.modifiedCount,
    };
};








export const markAllNotificationsAsReadService = async ({ userId }) => {
    const result = await markAllNotificationsAsReadRepository(userId);

    if (result.modifiedCount > 0) {
        emitAllNotificationsRead(userId);
    }

    logger.info(
        {
            userId,
            modifiedCount: result.modifiedCount,
        },
        "notification.all.markedAsRead",
    );

    return {
        modifiedCount: result.modifiedCount,
    };
};









export const deleteSelectedNotificationsService = async ({
    userId,
    notificationIds,
}) => {
    const result = await deleteSelectedNotificationsRepository({
        userId,
        notificationIds,
    });

    if (result.deletedCount > 0) {
        emitNotificationsDeleted(userId, notificationIds);
    }

    logger.info(
        {
            userId,
            notificationIds,
            deletedCount: result.deletedCount,
        },
        "notification.selected.deleted",
    );

    return {
        deletedCount: result.deletedCount,
    };
};










export const deleteAllNotificationsService = async ({ userId }) => {
    const result = await deleteAllNotificationsRepository(userId);

    if (result.deletedCount > 0) {
        emitAllNotificationsDeleted(userId);
    }

    logger.info(
        {
            userId,
            deletedCount: result.deletedCount,
        },
        "notification.all.deleted",
    );

    return {
        deletedCount: result.deletedCount,
    };
};
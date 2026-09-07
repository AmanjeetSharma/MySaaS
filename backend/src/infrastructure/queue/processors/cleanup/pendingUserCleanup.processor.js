import { PendingUser } from "#/modules/user/pendingUser.model.js";
import { deleteFromCloudinary } from "#/integrations/cloudinary.integration.js";
import logger from "#/config/logger.js";

const CLEANUP_BATCH_SIZE = 100;

export const processPendingUserCleanup = async () => {
    const now = new Date();

    const expiredUsers = await PendingUser.find({
        verificationTokenExpiry: { $lt: now },
    })
        .select("_id email avatar")
        .limit(CLEANUP_BATCH_SIZE);

    if (expiredUsers.length === 0) {
        return {
            deletedCount: 0,
        };
    }

    for (const user of expiredUsers) {
        if (user.avatar?.publicId) {
            await deleteFromCloudinary(user.avatar.publicId);
        }
    }

    const userIds = expiredUsers.map((user) => user._id);

    const result = await PendingUser.deleteMany({
        _id: { $in: userIds },
    });

    logger.info(
        {
            deletedCount: result.deletedCount,
        },
        "cleanup.pendingUserCleanup.completed"
    );

    return {
        deletedCount: result.deletedCount,
    };
};
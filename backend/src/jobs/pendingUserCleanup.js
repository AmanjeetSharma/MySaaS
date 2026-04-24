import { PendingUser } from "../modules/user/pendingUser.model.js";
import { deleteFromCloudinary } from "../services/cloudinary.service.js"

export const runPendingUserCleanup = async () => {
    try {
        // console.log("Running pending user cleanup...");

        const expiredUsers = await PendingUser.find({
            verificationTokenExpiry: { $lt: new Date() }
        });

        for (const user of expiredUsers) {
            if (user.avatar?.publicId) {
                const result = await deleteFromCloudinary(user.avatar.publicId);
                if (result) {
                    console.log(`${chalk.green("[cron-job]")} Removed avatar from Cloudinary for expired pending user | email: ${user.email}`);
                }
            }
        }

        const deletedUsers = await PendingUser.deleteMany({
            verificationTokenExpiry: { $lt: new Date() }
        });

        console.log(`${chalk.green("[cron-job]")} Cleanup done | removed: ${deletedUsers.deletedCount} | Deleted user emails: ${deletedUsers.deletedCount > 0 ? expiredUsers.map(u => u.email).join(", ") : "None"}`);
    } catch (error) {
        console.error(`${chalk.red("[cron-job]")} Cleanup job failed:`, error.message);
    }
};
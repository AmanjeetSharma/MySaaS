import { PendingUser } from "../modules/user/pendingUser.model.js";
import { deleteFromCloudinary } from "../services/cloudinary.service.js"
import chalk from "chalk";

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
                    console.log(`${new Date().toLocaleString()} ${chalk.green("[PendingUserCleanup]")} Removed avatar from Cloudinary for expired pending user | email: ${user.email}`);
                }
            }
        }

        const deletedUsers = await PendingUser.deleteMany({
            verificationTokenExpiry: { $lt: new Date() }
        });

        console.log(`${new Date().toLocaleString()} ${chalk.green("[PendingUserCleanup]")} Cleanup done | removed: ${deletedUsers.deletedCount} | Deleted user emails: ${deletedUsers.deletedCount > 0 ? expiredUsers.map(u => u.email).join(", ") : "None"}`);
    } catch (error) {
        console.error(`${new Date().toLocaleString()} ${chalk.red("[PendingUserCleanup]")} Cleanup job failed:`, error.message);
    }
};
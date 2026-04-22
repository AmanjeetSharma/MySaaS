import { PendingUser } from "../modules/user/pendingUser.model.js";
import { deleteFromCloudinary } from "../services/cloudinary.service.js"

export const runPendingUserCleanup = async () => {
    try {
        console.log("Running pending user cleanup...");

        const expiredUsers = await PendingUser.find({
            verificationTokenExpiry: { $lt: new Date() }
        });

        for (const user of expiredUsers) {
            if (user.avatar?.publicId) {
                await deleteFromCloudinary(user.avatar.publicId);
            }
        }

        const deletedUsers = await PendingUser.deleteMany({
            verificationTokenExpiry: { $lt: new Date() }
        });

        console.log(`Cleanup done | removed: ${deletedUsers.deletedCount}\nDeleted user emails: ${expiredUsers.map(u => u.email).join(", ")}`);
    } catch (error) {
        console.error("Cleanup job failed:", error.message);
    }
};
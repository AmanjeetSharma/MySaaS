import { Invitation } from "../modules/organization/member/invitation.model.js";
import chalk from "chalk";

export const runInvitationCleanup = async () => {
    try {
        const now = new Date();

        const expiredInvites = await Invitation.find({
            status: "pending",
            expiresAt: { $lt: now }
        }).select("email organization");

        if (expiredInvites.length === 0) {
            console.log(`${new Date().toLocaleString()} ${chalk.yellow("[InvitationCleanup]")} No expired invitations found`);
            return;
        }

        const result = await Invitation.updateMany(
            {
                status: "pending",
                expiresAt: { $lt: now }
            },
            {
                $set: { status: "expired" }
            }
        );

        console.log(
            `${new Date().toLocaleString()} ${chalk.green("[InvitationCleanup]")} Marked expired invites: ${result.modifiedCount} | Emails: ${expiredInvites.map(i => i.email).join(", ")}`
        );

    } catch (error) {
        console.error(
            `${new Date().toLocaleString()} ${chalk.red("[InvitationCleanup]")} Cleanup job failed:`,
            error.message
        );
    }
};
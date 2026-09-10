import mongoose from "mongoose";
import logger from "#/config/logger.js";
import env from "../../../config/env.config.js";
import { ApiError } from "../../../utils/ApiError.js";
import { emailValidator } from "../../../validations/auth.validators.js";
import { sendEmail } from "../../../integrations/email.integration.js";
import { invitationEmailTemplate } from "../../../utils/email/invitationEmailTemplate.js";
import {
    findOrganizationById,
    findUserById,
    unsetActiveOrganizationForUsers,
} from "../organization.repository.js";
import {
    findInvitationByEmail,
    createInvitation,
    findUserByEmail,
    findInvitationByToken,
    addNewMemberToOrganization,
    findInvitationsByOrg
} from "./member.repository.js";
import { checkOrganizationAccess } from "../organization.access.js";
import {
    formatOrganizationMembers,
    buildInvitationRealtimePayload,
    buildMemberJoinedRealtimePayload,
} from "./member.helper.js";
import { emitMemberInvitation } from "#/infrastructure/websocket/emitters/member.emitter.js";
import {
    buildNotification,
    createNotification,
    getOrganizationNotificationRecipients,
} from "../../notification/notification.utils.js";
import { NOTIFICATION_TYPES } from "#/modules/notification/notification.constants.js";





export const getMembersService = async ({
    userId,
    orgId
}) => {

    if (!orgId) throw new ApiError(400, "Organization ID is required");
    if (!mongoose.Types.ObjectId.isValid(orgId)) throw new ApiError(400, "Invalid organization ID");

    const org = await findOrganizationById(orgId, null, [
        { path: "owner", select: "name email" },
        { path: "members.user", select: "name email" }
    ]);
    if (!org) throw new ApiError(404, "Organization not found");

    checkOrganizationAccess(userId, orgId);

    const members = formatOrganizationMembers(org);

    logger.info(
        {
            organizationId: org._id,
            organization: org.name,
            memberCount: members.length
        },
        "member.list.retrieved"
    )

    return {
        members,
        memberCount: members.length
    };
};










export const inviteMemberService = async ({
    userId,
    inviterName,
    orgId,
    email
}) => {

    if (!orgId) throw new ApiError(400, "Organization ID is required");
    if (!email) throw new ApiError(400, "Email is required");
    if (!inviterName) throw new ApiError(400, "Inviter name is required");
    if (!mongoose.Types.ObjectId.isValid(orgId)) throw new ApiError(400, "Invalid organization ID");

    const cleanedEmail = email.trim().toLowerCase();

    if (!emailValidator(cleanedEmail)) {
        throw new ApiError(400, "Please provide a valid email address");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const org = await findOrganizationById(orgId, session);
        if (!org) {
            throw new ApiError(404, "Organization not found");
        }

        checkOrganizationAccess(userId, orgId);

        if (org.owner.toString() !== userId.toString()) {
            throw new ApiError(403, "You are not authorized to invite members.");
        }

        const existingUser = await findUserByEmail(cleanedEmail, null, session);
        if (existingUser) {
            const alreadyAMember = org.members.some(
                m => m.user.toString() === existingUser._id.toString()
            );
            if (alreadyAMember) {
                throw new ApiError(400, `User is already a member of ${org.name}`);
            }
        }

        const alreadyInvited = await findInvitationByEmail(org, cleanedEmail, session);
        if (alreadyInvited) {
            throw new ApiError(400, `An invitation has already been sent to ${cleanedEmail}`);
        }

        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

        const invitationPayload = {
            organization: orgId,
            email: cleanedEmail,
            role: "member",
            invitedBy: userId,
            status: "pending",
            token: hashedToken,
            expiresAt: expiresAt
        };

        const invitation = await createInvitation(invitationPayload, session);

        await session.commitTransaction();

        if (existingUser) {
            const realtimePayload = buildInvitationRealtimePayload({
                invitation,
                organization: org,
                invitedBy: {
                    _id: userId,
                    name: inviterName,
                },
            });

            const notification = buildNotification({
                type: NOTIFICATION_TYPES.MEMBER_INVITATION,
                title: "Organization Invitation",
                message: `${inviterName} invited you to join ${org.name}`,
                data: {
                    invitationId: invitation._id,
                    organizationId: org._id,
                    organizationName: org.name,
                    role: invitation.role,
                },
            });

            await createNotification({
                userId: existingUser._id,
                organizationId: org._id,
                notification,
            });

            emitMemberInvitation(existingUser._id, realtimePayload);

            logger.info(
                {
                    organizationId: org._id,
                    organization: org.name,
                    invitedUserId: existingUser._id,
                    invitedEmail: cleanedEmail,
                    invitationId: invitation._id,
                },
                "member.invitation.delivered_to_existing_user"
            );

        } else {
            const emailContent = invitationEmailTemplate(inviterName, org.name);

            if (env.EMAIL_ENABLED) {

                await sendEmail(
                    cleanedEmail,
                    "Invitation to Join Organization",
                    emailContent,
                    true
                );

                logger.info(
                    {
                        organizationId: org._id,
                        organization: org.name,
                        invitedEmail: cleanedEmail,
                        invitationId: invitation._id,
                    },
                    "member.invitation.email.sent"
                );
            } else {
                logger.warn(
                    {
                        organizationId: org._id,
                        organization: org.name,
                        invitedEmail: cleanedEmail,
                        invitationId: invitation._id,
                    },
                    "member.invitation.email_disabled"
                );
            }
        }
        return {
            email: cleanedEmail,
            organization: org.name,
            invitedBy: userId,
            inviterName: inviterName,
            invitationId: invitation._id,
            expiresAt: invitation.expiresAt,
            invitationType: existingUser ? "Existing User" : "New User"
        };

    } catch (error) {

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        if (error instanceof ApiError) {
            throw error;
        } else {
            logger(
                {
                    organizationId: org?._id,
                    organization: org?.name,
                    invitedEmail: email,
                    error
                },
                "member.invitation.error"
            );

            throw new ApiError(500, "An error occurred while inviting the member. Please try again.");
        }
    } finally {
        session.endSession();
    }
};








export const acceptInvitationService = async ({
    userId,
    userName,
    userEmail,
    orgId,
}) => {

    if (!orgId) throw new ApiError(400, "Organization ID is required");
    if (!mongoose.Types.ObjectId.isValid(orgId)) throw new ApiError(400, "Invalid organization ID");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const invitation = await findInvitationByEmail(orgId, userEmail, session);
        if (!invitation) {
            throw new ApiError(404, "This invitation does not exist or has already been accepted/expired.");
        }

        if (invitation.expiresAt <= new Date()) {
            invitation.status = "expired";

            await invitation.save({ session });

            throw new ApiError(400, "This invitation has expired. Please ask the organization owner to send a new invitation.");
        }

        const org = await findOrganizationById(invitation.organization, session);
        if (!org) {
            throw new ApiError(404, "Organization not found");
        }

        const alreadyAMember = org.members.some(
            (member) =>
                member.user.toString() === userId.toString()
        );

        if (alreadyAMember) {
            throw new ApiError(400, `You are already a member of ${org.name}`);
        }

        const joinedAt = new Date();

        const newMemberPayload = {
            user: userId,
            role: invitation.role,
            invitedBy: invitation.invitedBy,
            joinedAt,
        };

        await addNewMemberToOrganization(org._id, newMemberPayload, session);

        invitation.status = "accepted";
        invitation.acceptedAt = joinedAt;

        await invitation.save({ session });

        await session.commitTransaction();

        const notificationRecipients = getOrganizationNotificationRecipients(org);

        await Promise.all(
            notificationRecipients.map(async (recipientId) => {

                const notification = buildNotification({
                    type: NOTIFICATION_TYPES.MEMBER_JOINED,
                    title: "New Member Joined",
                    message: `A new member ${userName} has joined ${org.name}`,
                    data: {
                        memberId: userId,
                        organizationId: org._id,
                        organizationName: org.name,
                        role: invitation.role,
                    },
                });

                await createNotification({
                    userId: recipientId,
                    organizationId: org._id,
                    notification,
                });
            })
        );

        const memberPayload = buildMemberJoinedRealtimePayload({
            user: {
                _id: userId,
                name: userName,
                email: userEmail,
            },
            role: invitation.role,
            joinedAt,
        });

        emitMemberJoined(org._id, memberPayload);

        logger.info(
            {
                userId,
                organizationId: org._id,
                organization: org.name,
                invitationId: invitation._id,
                role: invitation.role,
                joinedAt,
            },
            "member.invitation.accepted"
        );

        return {
            organization: org.name,
            user: userName,
            email: userEmail,
            role: invitation.role,
            joinedAt,
        };

    } catch (error) {

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        if (error instanceof ApiError) {
            throw error;
        }

        logger.error(
            {
                userId,
                organizationId: orgId,
                error,
            },
            "member.invitation.accept.error"
        );

        throw new ApiError(
            500,
            "An error occurred while accepting the invitation. Please try again."
        );

    } finally {
        await session.endSession();
    }
};







export const getPendingInvitationsService = async ({
    userId,
    orgId
}) => {

    if (!orgId) throw new ApiError(400, "Organization ID is required");
    if (!mongoose.Types.ObjectId.isValid(orgId)) throw new ApiError(400, "Invalid organization ID");

    const org = await findOrganizationById(orgId, null);
    if (!org) throw new ApiError(404, "Organization not found");

    checkOrganizationAccess(userId, orgId);

    if (org.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to view invitations.");
    }

    const invitations = await findInvitationsByOrg(orgId, "email role invitedBy status expiresAt createdAt", [
        { path: "invitedBy", select: "name email" }
    ]);

    logger.info(
        {
            organizationId: org._id,
            organization: org.name,
            invitationCount: invitations.length,
        },
        "invitation.list.retrieved"
    );

    return invitations.map(invite => ({
        id: invite._id,
        email: invite.email,
        role: invite.role,
        inviter: invite.invitedBy?.name || null,
        inviterEmail: invite.invitedBy?.email || null,
        status: invite.status,
        expiresAt: invite.expiresAt,
        invitedAt: invite.createdAt
    }));
};








export const removeMemberService = async ({
    userId,
    orgId,
    memberId
}) => {

    if (!orgId) throw new ApiError(400, "Organization ID is required");
    if (!mongoose.Types.ObjectId.isValid(orgId)) throw new ApiError(400, "Invalid organization ID");
    if (!memberId) throw new ApiError(400, "Member ID is required");
    if (!mongoose.Types.ObjectId.isValid(memberId)) throw new ApiError(400, "Invalid member ID");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const org = await findOrganizationById(orgId, session);
        if (!org) {
            throw new ApiError(404, "Organization not found");
        }

        checkOrganizationAccess(userId, orgId);

        if (org.owner.toString() !== userId.toString()) {
            throw new ApiError(403, "You are not authorized to remove members.");
        }

        if (org.owner.toString() === memberId.toString()) {
            throw new ApiError(400, "You cannot remove yourself as the owner of the organization. Delete the organization instead.");
        }

        const memberExists = org.members.some(m => m.user.toString() === memberId.toString());
        if (!memberExists) {
            throw new ApiError(404, "This user is not a member of the organization");
        }

        org.members = org.members.filter(m => m.user.toString() !== memberId.toString());

        await org.save({ session });

        await unsetActiveOrganizationForUsers(orgId, session);

        await session.commitTransaction();

        logger.info(
            {
                organizationId: org._id,
                organization: org.name,
                removedMemberId: memberId
            },
            "member.removed"
        );

    } catch (error) {
        await session.abortTransaction();
        if (error instanceof ApiError) {
            throw error;
        } else {
            logger.error(
                {
                    organizationId: org._id,
                    organization: org.name,
                    removedMemberId: memberId,
                    error
                },
                "member.remove.error"
            );

            throw new ApiError(500, "An error occurred while removing the member. Please try again.");
        }
    } finally {
        session.endSession();
    }
};








export const leaveOrganizationService = async ({
    userId,
    orgId
}) => {

    if (!orgId) throw new ApiError(400, "Organization ID is required");
    if (!mongoose.Types.ObjectId.isValid(orgId)) throw new ApiError(400, "Invalid organization ID");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const org = await findOrganizationById(orgId, session);
        if (!org) {
            throw new ApiError(404, "Organization not found");
        }

        checkOrganizationAccess(userId, orgId);

        if (org.owner.toString() === userId.toString()) {
            throw new ApiError(400, "Owner cannot leave organization. Delete it instead");
        }

        const isMemberOfOrg = org.members.some(m => m.user.toString() === userId.toString());
        if (!isMemberOfOrg) {
            throw new ApiError(404, `You are not a member of ${org.name}`);
        }

        org.members = org.members.filter(m => m.user.toString() !== userId.toString());

        await org.save({ session });

        await unsetActiveOrganizationForUsers(orgId, session);

        await session.commitTransaction();

        logger.info(
            {
                organizationId: org._id,
                organization: org.name
            },
            "member.left"
        );

        return {
            success: true,
            message: "You have left the organization"
        };

    } catch (error) {
        await session.abortTransaction();
        if (error instanceof ApiError) {
            throw error;
        } else {
            logger.error(
                {
                    organizationId: org._id,
                    organization: org.name,
                    error
                },
                "member.leave.error"
            );

            throw new ApiError(500, "An error occurred while leaving the organization. Please try again.");
        }
    } finally {
        session.endSession();
    }
};
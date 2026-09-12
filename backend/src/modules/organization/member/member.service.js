import mongoose from "mongoose";
import logger from "#/config/logger.js";
import env from "../../../config/env.config.js";
import { ApiError } from "../../../utils/ApiError.js";
import { emailValidator } from "../../../validations/auth.validators.js";
import { sendEmail } from "../../../integrations/email.integration.js";
import { invitationEmailTemplate } from "../../../utils/email/invitationEmailTemplate.js";
import {
    findOrganizationById,
} from "../organization.repository.js";
import {
    findInvitationByEmail,
    findInvitationById,
    createInvitation,
    findUserByEmail,
    addNewMemberToOrganization,
    findInvitationsByOrg,
    findInvitationsByEmailForUser,
    unsetActiveOrgForUser,
    finduserById,
} from "./member.repository.js";
import { checkOrganizationAccess } from "../organization.access.js";
import {
    formatOrganizationMembers,
    formatMemberInfo,
    buildInvitationRealtimePayload,
    buildMemberJoinedRealtimePayload,
    buildMemberRemovedRealtimePayload,
    buildMemberLeftRealtimePayload,
    formatInvitations,
    buildInvitationDeclinedRealtimePayload,
} from "./member.helper.js";
import {
    emitMemberInvitation,
    emitMemberJoined,
    emitMemberRemovedToOrganization,
    emitMemberLeft,
    emitMemberDeclinedInvitation,
} from "#/infrastructure/websocket/emitters/member.emitter.js";
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
        { path: "owner", select: "name email avatar.url" },
        { path: "members.user", select: "name email avatar.url" }
    ]);
    if (!org) throw new ApiError(404, "Organization not found");

    await checkOrganizationAccess(userId, orgId);

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










export const getMemberInfoService = async ({
    userId,
    orgId,
    memberId
}) => {
    if (!orgId) throw new ApiError(400, "Organization ID is required");
    if (!mongoose.Types.ObjectId.isValid(orgId)) throw new ApiError(400, "Invalid organization ID");

    if (!memberId) throw new ApiError(400, "Member ID is required");
    if (!mongoose.Types.ObjectId.isValid(memberId)) throw new ApiError(400, "Invalid member ID");

    const org = await findOrganizationById(orgId, null, [
        { path: "owner", select: "name email avatar.url phone.number settings.timezone createdAt" },
        { path: "members.user", select: "name email avatar.url phone.number settings.timezone createdAt" }
    ]);
    if (!org) throw new ApiError(404, "Organization not found");

    await checkOrganizationAccess(userId, orgId);

    // owner
    if (org.owner._id.toString() === memberId.toString()) {
        const memberInfo = formatMemberInfo({
            user: org.owner,
            role: "owner",
            joinedAt: org.createdAt
        });

        logger.info(
            {
                organizationId: org._id,
                memberId: org.owner._id,
                memberName: org.owner.name
            },
            "member.info.retrieved"
        );

        return memberInfo;
    }
    // Regular member
    const member = org.members.find(
        member => member.user._id.toString() === memberId.toString(),
    );

    if (!member) {
        throw new ApiError(404, "This user is not a member of this organization");
    }

    const memberInfo = formatMemberInfo({
        user: member.user,
        role: member.role,
        joinedAt: member.joinedAt
    });

    logger.info(
        {
            organizationId: org._id,
            memberId: member.user._id,
            memberName: member.user.name
        },
        "member.info.retrieved"
    );

    return memberInfo;
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

        await checkOrganizationAccess(userId, orgId);

        if (org.owner.toString() !== userId.toString()) {
            throw new ApiError(403, "You are not authorized to invite members for this organization.");
        }

        const existingUser = await findUserByEmail(cleanedEmail, null, session);
        if (existingUser) {
            const alreadyAMember = org.members.some(
                m => m.user.toString() === existingUser._id.toString()
            );
            if (alreadyAMember) {
                throw new ApiError(400, `User is already a member of this organization`);
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
                "member.invitation.sent_to_existing_user"
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

            logger.info(
                {
                    organizationId: org._id,
                    organization: org.name,
                    invitedEmail: cleanedEmail,
                    invitationId: invitation._id,
                },
                "member.invitation.sent_to_new_user"
            );

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










export const revokeInvitationService = async ({
    userId,
    orgId,
    invitationId
}) => {
    if (!orgId) throw new ApiError(400, "Organization ID is required");
    if (!mongoose.Types.ObjectId.isValid(orgId)) throw new ApiError(400, "Invalid organization ID");
    if (!invitationId) throw new ApiError(400, "Invitation ID is required");
    if (!mongoose.Types.ObjectId.isValid(invitationId)) throw new ApiError(400, "Invalid invitation ID");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const org = await findOrganizationById(orgId, session);
        if (!org) {
            throw new ApiError(404, "Organization not found");
        }

        await checkOrganizationAccess(userId, orgId);

        if (org.owner.toString() !== userId.toString()) {
            throw new ApiError(403, "You are not authorized to revoke invitations for this organization.");
        }

        const invitation = await findInvitationById(invitationId, session);
        if (!invitation) {
            throw new ApiError(404, "This invitation does not exist");
        }

        if (invitation.organization.toString() !== orgId.toString()) {
            throw new ApiError(403, "This invitation does not belong to this organization.");
        }

        if (invitation.status === "accepted") {
            throw new ApiError(400, "This invitation has already been accepted. You can remove the member from the organization instead.");
        }

        if (invitation.status === "declined") {
            throw new ApiError(400, "This invitation has already been declined already by the invited user.");
        }

        if (invitation.status === "revoked") {
            throw new ApiError(400, "This invitation has already been revoked.");
        }

        if (invitation.status === "expired" || invitation.expiresAt <= new Date()) {
            if (invitation.status !== "expired") {

                invitation.status = "expired";

                await invitation.save({ session });
            }

            throw new ApiError(400, "This invitation has expired and cannot be revoked.");
        }

        if (invitation.status !== "pending") {
            throw new ApiError(400, "This invitation cannot be revoked.");
        }

        const revokedAt = new Date();

        invitation.status = "revoked";
        invitation.revokedAt = revokedAt;

        await invitation.save({ session });

        await session.commitTransaction();

        logger.info(
            {
                userId,
                organizationId: org._id,
                organization: org.name,
                invitationId: invitation._id,
                invitedEmail: invitation.email,
                revokedAt,
            },
            "member.invitation.revoked"
        );

        return {
            invitationId: invitation._id,
            organization: org.name,
            email: invitation.email,
            status: invitation.status,
            revokedAt,
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
                invitationId,
                error,
            },
            "member.invitation.revoke.error"
        );

        throw new ApiError(500, "An error occurred while revoking the invitation. Please try again.");

    } finally {
        await session.endSession();
    }
};











export const acceptInvitationService = async ({
    userId,
    userName,
    userEmail,
    invitationId
}) => {

    if (!invitationId) throw new ApiError(400, "Invitation ID is required");
    if (!mongoose.Types.ObjectId.isValid(invitationId)) throw new ApiError(400, "Invalid invitation ID");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const invitation = await findInvitationById(invitationId, session);
        if (!invitation) {
            throw new ApiError(404, "This invitation does not exist");
        }

        if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
            throw new ApiError(403, "You are not authorized to accept this invitation.");
        }

        if (invitation.status === "revoked") {
            throw new ApiError(400, "This invitation has been revoked by the organization owner.");
        }

        if (invitation.status !== "pending") {
            throw new ApiError(400, "This invitation is no longer pending.");
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
            { error },
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












export const declineInvitationService = async ({
    userId,
    userName,
    userEmail,
    invitationId,
}) => {
    if (!invitationId) throw new ApiError(400, "Invitation ID is required");
    if (!mongoose.Types.ObjectId.isValid(invitationId)) throw new ApiError(400, "Invalid invitation ID");


    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const invitation = await findInvitationById(invitationId, session);

        if (!invitation) {
            throw new ApiError(404, "This invitation does not exist");
        }

        if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
            throw new ApiError(403, "You are not authorized to decline this invitation.");
        }

        if(invitation.status === "revoked") {
            throw new ApiError(400, "This invitation has been revoked by the organization owner.");
        }

        if (invitation.status !== "pending") {
            throw new ApiError(400, "This invitation is no longer pending.");
        }

        if (invitation.expiresAt <= new Date()) {
            invitation.status = "expired";

            await invitation.save({ session });

            throw new ApiError(400, "This invitation has expired.");
        }

        const org = await findOrganizationById(invitation.organization, session);
        if (!org) {
            throw new ApiError(404, "Organization not found");
        }

        const declinedAt = new Date();

        invitation.status = "declined";
        invitation.declinedAt = declinedAt;

        await invitation.save({ session });

        await session.commitTransaction();

        const notification = buildNotification({
            type: NOTIFICATION_TYPES.MEMBER_INVITATION_DECLINED,
            title: "Invitation Declined",
            message: `${userName} (${userEmail}) declined your invitation to join ${org.name}.`,

            data: {
                invitationId: invitation._id,
                organizationId: org._id,
                organizationName: org.name,
                userId,
                userName,
                userEmail,
            },
        });

        await createNotification({
            userId: org.owner,
            organizationId: org._id,
            notification,
        });

        const realtimePayload = buildInvitationDeclinedRealtimePayload({
            invitationId: invitation._id,
            organizationId: org._id,
            organizationName: org.name,

            user: {
                _id: userId,
                name: userName,
                email: userEmail,
            },
        });

        emitMemberDeclinedInvitation(
            org.owner,
            realtimePayload
        );

        logger.info(
            {
                userId,
                userName,
                userEmail,
                organizationId: org._id,
                organization: org.name,
                ownerId: org.owner,
                invitationId: invitation._id,
                declinedAt,
            },
            "member.invitation.declined"
        );

        return {
            invitationId: invitation._id,
            organization: org.name,
            declinedAt,
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
                invitationId,
                error,
            },
            "member.invitation.decline.error"
        );

        throw new ApiError(500, "An error occurred while declining the invitation. Please try again.");

    } finally {
        await session.endSession();
    }
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
        const org = await findOrganizationById(
            orgId,
            session,
            [
                {
                    path: "members.user",
                    select: "name email",
                },
            ]
        );
        if (!org) {
            throw new ApiError(404, "Organization not found");
        }

        await checkOrganizationAccess(userId, orgId);

        if (org.owner.toString() !== userId.toString()) {
            throw new ApiError(403, "You are not authorized to remove members.");
        }

        if (org.owner.toString() === memberId.toString()) {
            throw new ApiError(400, "You cannot remove yourself as the owner of the organization. Delete the organization instead.");
        }


        const removedMember = org.members.find(m => m.user._id.toString() === memberId.toString());
        if (!removedMember) {
            throw new ApiError(404, "This user is not a member of the organization");
        }

        const notificationRecipients =
            getOrganizationNotificationRecipients(org).filter(
                recipientId =>
                    recipientId.toString() !== memberId.toString()
            );

        org.members = org.members.filter(
            (member) =>
                member.user._id.toString() !== memberId.toString()
        );

        await org.save({ session });

        const activeOrgOfRemovedMember = await finduserById(memberId, "activeOrganization", session);
        if (activeOrgOfRemovedMember?.activeOrganization?.toString() === orgId.toString()) {
            await unsetActiveOrgForUser(memberId, session);
        }

        await session.commitTransaction();

        await Promise.all(
            notificationRecipients.map(async (recipientId) => {

                const notification = buildNotification({
                    type: NOTIFICATION_TYPES.MEMBER_REMOVED,
                    title: "Member Removed",
                    message: `${removedMember.user.name} has been removed from ${org.name}`,
                    data: {
                        memberId: removedMember.user._id,
                        memberName: removedMember.user.name,
                        organizationId: org._id,
                        organizationName: org.name,
                    },
                });

                await createNotification({
                    userId: recipientId,
                    organizationId: org._id,
                    notification,
                });
            })
        );

        const removedMemberNotification = buildNotification({
            type: NOTIFICATION_TYPES.MEMBER_REMOVED,
            title: "Removed from Organization",
            message: `You have been removed from ${org.name}`,
            data: {
                organizationId: org._id,
                organizationName: org.name,
            },
        });

        await createNotification({
            userId: memberId,
            organizationId: org._id,
            notification: removedMemberNotification,
        });

        const memberPayload = buildMemberRemovedRealtimePayload({
            user: removedMember.user,
            organizationId: org._id,
            organizationName: org.name,
        });

        emitMemberRemovedToOrganization(org._id, memberId, memberPayload);

        logger.info(
            {
                organizationId: org._id,
                organization: org.name,
                removedMemberId: memberId,
                removedMemberName: removedMember.user.name,
            },
            "member.removed"
        );

        return {
            memberId,
            memberName: removedMember.user.name,
            organization: org.name,
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
    userName,
    userEmail,
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

        await checkOrganizationAccess(userId, orgId);

        if (org.owner.toString() === userId.toString()) {
            throw new ApiError(400, "Owner cannot leave organization. Delete it instead");
        }

        const isMemberOfOrg = org.members.some(m => m.user.toString() === userId.toString());
        if (!isMemberOfOrg) {
            throw new ApiError(404, `You are not a member of ${org.name}`);
        }

        const notificationRecipients = getOrganizationNotificationRecipients(org);

        org.members = org.members.filter(m => m.user.toString() !== userId.toString());

        await org.save({ session });

        const usersActiveOrg = await finduserById(userId, "activeOrganization", session);
        if (usersActiveOrg?.activeOrganization?.toString() === orgId.toString()) {
            await unsetActiveOrgForUser(userId, session);
        }

        session.commitTransaction();

        await Promise.all(
            notificationRecipients.map(async (recipientId) => {

                const notification = buildNotification({
                    type: NOTIFICATION_TYPES.MEMBER_LEFT,
                    title: "Member Left",
                    message: `${userName} has left ${org.name}`,
                    data: {
                        memberId: userId,
                        memberName: userName,
                        organizationId: org._id,
                        organizationName: org.name,
                    },
                });

                await createNotification({
                    userId: recipientId,
                    organizationId: org._id,
                    notification,
                });
            })
        );

        const leavingMemberNotification = buildNotification({
            type: NOTIFICATION_TYPES.MEMBER_LEFT,
            title: "Left Organization",
            message: `You have left ${org.name}`,
            data: {
                organizationId: org._id,
                organizationName: org.name,
            },
        });

        await createNotification({
            userId,
            organizationId: org._id,
            notification: leavingMemberNotification,
        });

        const memberPayload = buildMemberLeftRealtimePayload({
            user: {
                _id: userId,
                name: userName,
                email: userEmail,
            },
            organizationId: org._id,
            organizationName: org.name,
        });

        emitMemberLeft(org._id, userId, memberPayload);

        logger.info(
            {
                organizationId: org._id,
                organization: org.name,
                memberId: userId,
                memberName: userName,
            },
            "member.left"
        );

        return {
            success: true,
            message: `You have left ${org.name} successfully`,
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














export const getInvitationsService = async ({
    userId,
    orgId
}) => {

    if (!orgId) throw new ApiError(400, "Organization ID is required");
    if (!mongoose.Types.ObjectId.isValid(orgId)) throw new ApiError(400, "Invalid organization ID");

    const org = await findOrganizationById(orgId, null);
    if (!org) throw new ApiError(404, "Organization not found");

    await checkOrganizationAccess(userId, orgId);

    if (org.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to view invitations.");
    }

    const invitations = await findInvitationsByOrg(
        orgId,
        "organization email role invitedBy status expiresAt createdAt acceptedAt declinedAt revokedAt",
        [
            {
                path: "invitedBy",
                select: "name email",
            },
            {
                path: "organization",
                select: "name",
            },
        ]
    );

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
        acceptedAt: invite.acceptedAt,
        declinedAt: invite.declinedAt,
        revokedAt: invite.revokedAt,
        invitedAt: invite.createdAt
    }));
};












export const getMyInvitationsService = async ({
    userEmail,
}) => {

    if (!userEmail) {
        throw new ApiError(400, "User email is required");
    }

    const invitations = await findInvitationsByEmailForUser(
        userEmail,
        "organization email role invitedBy status expiresAt createdAt acceptedAt declinedAt revokedAt",
        [
            {
                path: "organization",
                select: "name",
            },
            {
                path: "invitedBy",
                select: "_id name email",
            },
        ]
    );

    logger.info(
        {
            email: userEmail,
            invitationCount: invitations.length,
        },
        "invitation.my_list.retrieved"
    );

    return formatInvitations(invitations);
};


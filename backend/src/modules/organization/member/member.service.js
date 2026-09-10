import mongoose from "mongoose";
import crypto from "crypto";
import env from "../../../config/env.config.js";
import { generateToken } from "../../../utils/token.js";
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
import { formatOrganizationMembers } from "./member.helper.js";
import logger from "#/config/logger.js";






export const getMembersService = async ({ userId, orgId }) => {
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
            userId: userId,
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










export const inviteMemberService = async (userId, inviterName, orgId, email) => {
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

        const existingMember = await findUserByEmail(cleanedEmail, null, session);
        if (existingMember) {
            const alreadyAMember = org.members.some(
                m => m.user.toString() === existingMember._id.toString()
            );
            if (alreadyAMember) {
                throw new ApiError(400, `User is already a member of ${org.name}`);
            }
        }

        const alreadyInvited = await findInvitationByEmail(org, cleanedEmail, session);
        if (alreadyInvited) {
            throw new ApiError(400, `An invitation has already been sent to ${cleanedEmail}`);
        }

        const { rawToken, hashedToken } = generateToken();
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

        const acceptUrl = `${env.CLIENT_URL}/invitations/accept?token=${rawToken}`;
        const emailContent = invitationEmailTemplate(inviterName, org.name, acceptUrl);

        if (env.EMAIL_ENABLED) {
            await sendEmail(cleanedEmail, "Invitation to Join Organization", emailContent, true);

            logger.info(
                {
                    userId: userId,
                    organizationId: org._id,
                    organization: org.name,
                    invitedEmail: cleanedEmail,
                    invitationId: invitation._id
                },
                "member.invitation.sent"
            );
        } else {
            logger.warn(
                {
                    userId: userId,
                    organizationId: org._id,
                    organization: org.name,
                    invitedEmail: cleanedEmail,
                    invitationId: invitation._id
                },
                "member.invitation.email_disabled"
            );
        }

        logger.info(
            {
                email: cleanedEmail,
                organizationId: org._id,
                organizationName: org.name,
                invitationId: invitation._id,
                expiresAt,
                rawToken: env.NODE_ENV === "development" ? rawToken : undefined,
            },
            "member.invitation.sent"
        );

        return {
            email: cleanedEmail,
            organization: org.name,
            invitedBy: userId,
            inviterName: inviterName,
            invitationId: invitation._id,
            expiresAt: invitation.expiresAt
        };

    } catch (error) {
        await session.abortTransaction();
        if (error instanceof ApiError) {
            throw error;
        } else {
            logger(
                {
                    userId: userId,
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











export const acceptInvitationService = async (userId, token) => {
    if (!token) throw new ApiError(400, "Invitation token is missing");

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const invitation = await findInvitationByToken(hashedToken, "+token", session);
        if (!invitation) {
            throw new ApiError(400, "Invalid or expired invitation token");
        }

        if (invitation.expiresAt < new Date()) {
            invitation.status = "expired";
            invitation.token = null;
            await invitation.save({ session });
            throw new ApiError(400, "The invitation link has expired. Please contact the inviter to generate a new one.");
        }

        const org = await findOrganizationById(invitation.organization, session);
        if (!org) {
            throw new ApiError(404, "Organization not found");
        }

        const user = await findUserById(userId, null, session);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
            throw new ApiError(403, "This invitation was not sent to your email address");
        }

        const alreadyAMember = org.members.some(
            m => m.user.toString() === userId.toString()
        );

        if (!alreadyAMember) {
            const newMemberPayload = {
                user: userId,
                role: invitation.role,
                invitedBy: invitation.invitedBy,
                joinedAt: new Date()
            };

            await addNewMemberToOrganization(org._id, newMemberPayload, session);
        }

        invitation.status = "accepted";
        invitation.token = null;

        await invitation.save({ session });

        await session.commitTransaction();

        logger(
            {
                userId: userId,
                organizationId: org._id,
                organization: org.name,
                invitationId: invitation._id
            },
            "member.invitation.accepted"
        );

        return {
            organization: org.name,
            user: user.name,
            email: user.email,
            role: invitation.role
        };

    } catch (error) {
        await session.abortTransaction();
        if (error instanceof ApiError) {
            throw error;
        } else {
            logger(
                {
                    userId: userId,
                    organizationId: org?._id,
                    organization: org?.name,
                    invitationId: invitation?._id,
                    error
                },
                "member.invitation.accept.error"
            );

            throw new ApiError(500, "An error occurred while accepting the invitation. Please try again.");
        }
    } finally {
        session.endSession();
    }
};









export const getPendingInvitationsService = async ({ userId, orgId }) => {
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
            userId: userId,
            organizationId: org._id,
            organization: org.name,
            invitationCount: invitations.length
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








export const removeMemberService = async ({ userId, orgId, memberId }) => {
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
                userId: userId,
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
                    userId: userId,
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








export const leaveOrganizationService = async ({ userId, orgId }) => {
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
                userId: userId,
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
                    userId: userId,
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
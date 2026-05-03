import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import env from "../../../config/env.config.js";
import { generateToken } from "../../../utils/token.js";
import { ApiError } from "../../../utils/ApiError.js";
import { emailValidator } from "../../../validations/auth.validators.js";
import { findOrganizationById, findUserById } from "../organization.repository.js";
import { sendEmail } from "../../../integrations/email.integration.js";
import { invitationEmailTemplate } from "../../../utils/email/invitationEmailTemplate.js";
import {
    findInvitationByEmail,
    createInvitation,
    findUserByEmail,
    findInvitationByToken,
    addNewMemberToOrganization,
    findInvitationsByOrg
} from "./member.repository.js";







export const getMembersService = async (userId, orgId) => {
    if (!userId) throw new ApiError(400, "Unauthorized access");
    if (!orgId) throw new ApiError(400, "Organization ID is required");
    if (!mongoose.Types.ObjectId.isValid(orgId)) throw new ApiError(400, "Invalid organization ID");

    const org = await findOrganizationById(orgId, null, [
        { path: "owner", select: "name email" },
        { path: "members.user", select: "name email" }
    ]);
    if (!org) throw new ApiError(404, "Organization not found");

    const isMember =
        org.owner._id.toString() === userId.toString() ||
        org.members.some(member => member.user._id.toString() === userId.toString());

    if (!isMember) throw new ApiError(403, "Access denied");

    const members = [
        {
            id: org.owner._id,
            name: org.owner.name,
            email: org.owner.email,
            role: "owner",
            joinedAt: org.createdAt
        },
        ...org.members.map(m => ({
            id: m.user._id,
            name: m.user.name,
            email: m.user.email,
            role: m.role,
            joinedAt: m.joinedAt
        }))
    ];

    console.log(`Members fetched for organization ${org.name} | Total members: ${members.length}`);

    return {
        members,
        memberCount: members.length
    };
};










export const inviteMemberService = async (userId, inviterName, orgId, email) => {
    if (!userId) throw new ApiError(400, "Unauthorized access");
    if (!orgId) throw new ApiError(400, "Organization ID is required");
    if (!email) throw new ApiError(400, "Email is required");
    if (!inviterName) throw new ApiError(400, "Inviter name is required");
    if (!mongoose.Types.ObjectId.isValid(orgId)) throw new ApiError(400, "Invalid organization ID");

    const cleanedEmail = email.trim().toLowerCase();

    if (!emailValidator(cleanedEmail)) throw new ApiError(400, "Please provide a valid email address");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const org = await findOrganizationById(orgId, session);
        if (!org) {
            throw new ApiError(404, "Organization not found");
        }

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
            console.log(`Invite email sent to ${cleanedEmail} | InvitationLink: ${acceptUrl}`);
        } else {
            console.log(`Email service is disabled. Skipping invitation email for ${cleanedEmail}`);
        }

        console.log(`Invitation token for ${cleanedEmail}: ${rawToken} | Expires at: ${expiresAt.toLocaleString()}`);// development log
        console.log(`Member invited: ${cleanedEmail} to organization ${org.name} by ${inviterName} | Invitation ID: ${invitation._id}`);

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
            console.error("Error inviting member:", error);
            throw new ApiError(500, "An error occurred while inviting the member. Please try again.");
        }
    } finally {
        session.endSession();
    }
};











export const acceptInvitationService = async (userId, token) => {
    if (!userId) throw new ApiError(400, "Unauthorized access");
    if (!token) throw new ApiError(400, "Invitation token is missing");

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const invitation = await findInvitationByToken(hashedToken, session);
        if (!invitation) {
            throw new ApiError(400, "Invalid or expired invitation token");
        }

        if (invitation.expiresAt < new Date()) {
            invitation.status = "expired";
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
            const newMember = await addNewMemberToOrganization(org._id, newMemberPayload, session);
        }

        invitation.status = "accepted";

        await invitation.save({ session });

        await session.commitTransaction();

        console.log(`Invitation accepted by ${user.email} for organization ${org.name} | Invitation ID: ${invitation._id}`);

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
            console.error("Error accepting invitation:", error);
            throw new ApiError(500, "An error occurred while accepting the invitation. Please try again.");
        }
    } finally {
        session.endSession();
    }
};









export const getPendingInvitationsService = async (userId, orgId) => {
    if (!userId) throw new ApiError(400, "Unauthorized access");
    if (!orgId) throw new ApiError(400, "Organization ID is required");
    if (!mongoose.Types.ObjectId.isValid(orgId)) throw new ApiError(400, "Invalid organization ID");

    const org = await findOrganizationById(orgId, null);
    if (!org) throw new ApiError(404, "Organization not found");

    if (org.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to view invitations.");
    }

    const invitations = await findInvitationsByOrg(orgId, "email role status expiresAt createdAt invitedBy", [
        { path: "invitedBy", select: "name email" }
    ]);
    console.log(`Pending invitations fetched for organization ${org.name} | Total pending invitations: ${invitations.length}`);

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

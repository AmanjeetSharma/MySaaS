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
import { findInvited, createInvitation, findUserByEmail } from "./member.repository.js";
import { count } from "console";







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

        const alreadyInvited = await findInvited(org, cleanedEmail, session);
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







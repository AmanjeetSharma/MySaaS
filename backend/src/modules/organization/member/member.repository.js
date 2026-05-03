import { User } from "../../user/user.model.js";
import { Organization } from "../organization.model.js";
import { Invitation } from "./invitation.model.js";


export const findInvitationByEmail = async (org, email, session) => {
    let query = Invitation.findOne({
        organization: org._id,
        email: email,
        status: "pending",
        expiresAt: { $gt: new Date() } // only non-expired ones
    });
    if (session) {
        query = query.session(session);
    }
    return await query;
};


export const createInvitation = async (invitationPayload, session) => {
    let query = new Invitation(invitationPayload);
    return await query.save({ session });
};


export const findUserByEmail = async (email, selectedFields, session) => {
    let query = User.findOne({ email: email });
    if (selectedFields) {
        query = query.select(selectedFields);
    }
    if (session) {
        query = query.session(session);
    }
    return await query;
};


export const findInvitationByToken = async (hashedToken, selectedFields, session) => {
    let query = Invitation.findOne({ token: hashedToken, status: "pending" });
    if (selectedFields) {
        query = query.select(selectedFields);
    }
    if (session) {
        query = query.session(session);
    }
    return await query;
};


export const addNewMemberToOrganization = async (orgId, memberPayload, session) => {
    let query = Organization.updateOne(
        {
            _id: orgId,
            "members.user": { $ne: memberPayload.user } // prevent duplicate user
        },
        {
            $push: { members: memberPayload }
        }
    );
    if (session) {
        query = query.session(session);
    }

    return await query;
};


export const findInvitationsByOrg = async (orgId, selectedFields, populate = []) => {
    let query = Invitation.find({
        organization: orgId,
        status: "pending",
        expiresAt: { $gt: new Date() } // only non-expired ones
    })
    if (selectedFields) {
        query = query.select(selectedFields);
    }
    if (populate.length > 0) {
        populate.forEach(option => {
            query = query.populate(option);
        });
    }
    return await query;
};
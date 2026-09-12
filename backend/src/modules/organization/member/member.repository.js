import { User } from "../../user/user.model.js";
import { Organization } from "../organization.model.js";
import { Invitation } from "./invitation.model.js";



export const findInvitationById = async (invitationId, session) => {
    let query = Invitation.findById(invitationId);
    if (session) {
        query = query.session(session);
    }
    return query;
};


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
    return query;
};


export const createInvitation = async (invitationPayload, session) => {
    let query = new Invitation(invitationPayload);
    return query.save({ session });
};


export const findUserByEmail = async (email, selectedFields, session) => {
    let query = User.findOne({ email: email });
    if (selectedFields) {
        query = query.select(selectedFields);
    }
    if (session) {
        query = query.session(session);
    }
    return query;
};


export const finduserById = async (userId, selectedFields, session) => {
    let query = User.findById(userId);
    if (selectedFields) {
        query = query.select(selectedFields);
    }
    if (session) {
        query = query.session(session);
    }
    return query;
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

    return query;
};


export const findInvitationsByOrg = async (orgId, selectedFields, populate = []) => {
    let query = Invitation.find({
        organization: orgId,
    })
    if (selectedFields) {
        query = query.select(selectedFields);
    }
    if (populate.length > 0) {
        populate.forEach(option => {
            query = query.populate(option);
        });
    }
    return query.sort({ createdAt: -1 });
};


export const findInvitationsByEmailForUser = async (
    email,
    selectedFields,
    populate = []
) => {
    let query = Invitation.find({
        email: email.toLowerCase(),
    });

    if (selectedFields) {
        query = query.select(selectedFields);
    }

    if (populate.length > 0) {
        populate.forEach((option) => {
            query = query.populate(option);
        });
    }

    return query.sort({ createdAt: -1 });
};


export const unsetActiveOrgForUser = async (userId, session) => {
    let query = User.updateOne(
        { _id: userId },
        { $unset: { activeOrganization: null } }
    );
    if (session) {
        query = query.session(session);
    }
    return query;
}
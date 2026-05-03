import { User } from "../../user/user.model.js";
import { Organization } from "../organization.model.js";
import { Invitation } from "./invitation.model.js";


export const findInvited = async (org, email, session) => {
    let query = Invitation.findOne({
        organization: org._id,
        email: email,
        status: "pending"
    });
    if (session) {
        query = query.session(session);
    }
    return await query;
};


export const createInvitation = async (invitationPayload, session) => {
    return Invitation.create(invitationPayload, { session });
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
import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { Organization } from "./organization.model.js";

export const findOrganizationById = async (orgId, selectedFields) => {
    let query = Organization.findById(orgId);
    if (selectedFields) {
        query = query.select(selectedFields);
    }
    return query;
}

export const checkOrganizationAccess = async (userId, orgId) => {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Organization ID is required and must be a valid ObjectId");
    }

    const organization = await findOrganizationById(orgId, "owner members");
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    const hasAccess =
        userId.toString() === organization.owner.toString() ||
        organization.members.some(
            (member) =>
                member.user.toString() === userId.toString()
        );

    if (!hasAccess) {
        throw new ApiError(403, "Access denied. You do not have permission to perform this action.");
    }

    return organization;
}
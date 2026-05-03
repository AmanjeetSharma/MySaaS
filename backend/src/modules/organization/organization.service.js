import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { nameValidator } from "../../validations/auth.validators.js";
import {
    findUserById,
    findExistingOrganization,
    createOrganization,
    findOrganizationById,
    deleteOrganizationById,
    setActiveOrganization,
    setActiveOrganizationForUsers,
    findOrganizationsByUserId
} from "./organization.repository.js";






export const createOrganizationService = async (userId, orgName) => {
    if (!userId) { throw new ApiError(400, "Unauthorized access"); }
    if (!orgName) { throw new ApiError(400, "Organization name is required"); }

    const cleanedOrgName = orgName.trim();

    const nameError = nameValidator(cleanedOrgName);
    if (!nameError.valid) {
        throw new ApiError(400, `Name is invalid: ${nameError.errors.join(", ")}`);
    }

    const existingOrganization = await findExistingOrganization(userId);
    if (existingOrganization) {
        throw new ApiError(409, "You already have an organization");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const org = await createOrganization({
            name: cleanedOrgName[0].toUpperCase() + cleanedOrgName.slice(1),
            owner: userId,
        }, session);
        if (!org) {
            throw new ApiError(500, "Failed to create organization - please try again");
        }

        const setActiveResult = await setActiveOrganization(userId, org._id, session);
        if (!setActiveResult) {
            throw new ApiError(500, "Organization created but failed to set as active - please try switching to it manually");
        }

        await session.commitTransaction();

        return {
            ...org.toObject(),
        };

    } catch (err) {
        await session.abortTransaction();

        if (err.code === 11000) { // Duplicate key error (e.g. unique index violation) to prevent race conditions
            throw new ApiError(409, "You already have an organization");
        }
        if (err instanceof ApiError) {
            throw err;
        } else {
            console.error("Error creating organization:", err);
            throw new ApiError(500, "An error occurred while creating the organization. Please try again.");
        }
    } finally {
        session.endSession();
    }
};








export const getOrganizationsService = async (userId) => {
    if (!userId) { throw new ApiError(400, "Unauthorized access"); }

    const organizations = await findOrganizationsByUserId(userId);
    if (!organizations || organizations.length === 0) {
        throw new ApiError(404, "No organizations found");
    }

    return organizations;
};






export const getOrganizationService = async (orgId, userId) => {
    if (!userId) { throw new ApiError(400, "Unauthorized access"); }
    if (!orgId) { throw new ApiError(400, "Organization ID is required"); }

    const org = await findOrganizationById(orgId);
    if (!org) {
        throw new ApiError(404, "Organization not found");
    }

    return org;
};





export const updateOrganizationService = async (orgId, updateData, userId) => {
    if (!userId) { throw new ApiError(400, "Unauthorized access"); }
    if (!orgId) { throw new ApiError(400, "Organization ID is required"); }
    if (!updateData) { throw new ApiError(400, "Data is required to update organization"); }

    const { orgName } = updateData;
    const cleanedOrgName = orgName.trim();

    const nameError = nameValidator(cleanedOrgName);
    if (!nameError.valid) {
        throw new ApiError(400, `Name is invalid: ${nameError.errors.join(", ")}`);
    }

    const org = await findOrganizationById(orgId);
    if (!org) { throw new ApiError(404, "Organization not found"); }

    if (org.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You do not have permission to update this organization");
    }

    org.name = cleanedOrgName[0].toUpperCase() + cleanedOrgName.slice(1);

    try {
        await org.save();
    } catch (err) {
        throw new ApiError(500, "Failed to update organization - please try again");
    }

    return org;
};






export const deleteOrganizationService = async (userId, orgId) => {
    if (!userId) { throw new ApiError(400, "Unauthorized access"); }
    if (!orgId) { throw new ApiError(400, "Organization ID is required"); }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!mongoose.Types.ObjectId.isValid(orgId)) {
            throw new ApiError(400, "Invalid organization ID");
        }
        const org = await findOrganizationById(orgId, session);
        if (!org) { throw new ApiError(404, "Organization not found"); }

        if (org.owner.toString() !== userId.toString()) {
            throw new ApiError(403, "You do not have permission to delete this organization");
        }

        // setting activeOrganization to null for all users before deletion to prevent dangling references
        await setActiveOrganizationForUsers(orgId, session);

        await deleteOrganizationById(orgId, session);

        await session.commitTransaction();

        return {
            success: true,
            message: "Organization deleted successfully"
        };

    } catch (err) {
        await session.abortTransaction();
        if (err instanceof ApiError) {
            throw err;
        } else {
            console.error("Error deleting organization:", err);
            throw new ApiError(500, "An error occurred while deleting the organization. Please try again.");
        }
    } finally {
        session.endSession();
    }
};








export const switchOrganizationService = async (userId, orgId) => {
    if (!userId) { throw new ApiError(400, "Unauthorized access"); }
    if (!orgId) { throw new ApiError(400, "Organization ID is required"); }

    const org = await findOrganizationsByUserId(userId);
    if (!org) {
        throw new ApiError(403, "You do not have access to this organization");
    }

    const user = await findUserById(userId);

    if (user.activeOrganization && user.activeOrganization.toString() === orgId.toString()) {
        throw new ApiError(400, "Your workspace is already set to this organization");
    }

    user.activeOrganization = orgId;

    try {
        await user.save();
    } catch (err) {
        throw new ApiError(500, "Failed to switch active organization - please try again");
    }

    return {
        success: true,
        userId: user._id,
        orgName: org.name,
        activeOrganization: user.activeOrganization,
    }
};
import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { organizationNameValidator } from "./organization.validator.js";
import {
    findUserById,
    findExistingOrganization,
    createOrganization,
    findOrganizationById,
    deleteOrganizationById,
    setActiveOrganization,
    unsetActiveOrganizationForUsers,
    findOrganizationsByUserId,
    countCustomersInOrganization,
} from "./organization.repository.js";
import { getOrganizationMeta } from "./organization.helper.js";
import { generateOrgSlug } from "../auth/auth.helper.js";





export const createOrganizationService = async (userId, orgName) => {
    if (!orgName) { throw new ApiError(400, "Organization name is required"); }

    const cleanedOrgName = orgName.trim();

    const nameError = organizationNameValidator(cleanedOrgName);
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
        const orgSlug = await generateOrgSlug(cleanedOrgName);
        const org = await createOrganization({
            name: cleanedOrgName[0].toUpperCase() + cleanedOrgName.slice(1),
            owner: userId,
            slug: orgSlug
        }, session);
        if (!org) {
            throw new ApiError(500, "Failed to create organization - please try again");
        }

        const setActiveResult = await setActiveOrganization(userId, org._id, session);
        if (!setActiveResult) {
            throw new ApiError(500, "Organization created but failed to set as active - please try switching to it manually");
        }

        await session.commitTransaction();

        console.log(`Organization ${org.name} (ID: ${org._id}) created by user ID: ${userId}`);

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
    const organizations = await findOrganizationsByUserId(userId);
    if (!organizations || organizations.length === 0) {
        throw new ApiError(404, "No organizations found");
    }

    const ownedOrganization = organizations.find(org => org.owner.toString() === userId.toString()) || null;
    const memberOrganizations = organizations.filter(org => org.owner.toString() !== userId.toString());

    console.log(`User ID: ${userId} - Owned Organization: ${ownedOrganization ? ownedOrganization.name : "None"}, Member Organizations: ${memberOrganizations.length}`);

    return {
        ownedOrganization: ownedOrganization || null,
        memberOrganizations: memberOrganizations || []
    }
};






export const getOrganizationService = async (orgId, userId) => {
    if (!orgId) throw new ApiError(400, "Organization ID is required");

    const org = await findOrganizationById(orgId);
    if (!org) {
        throw new ApiError(404, "Organization not found");
    }

    const isOwner = org.owner.toString() === userId.toString();

    const isMember = org.members.some(
        member => member.user.toString() === userId.toString()
    );

    if (!isOwner && !isMember) {
        throw new ApiError(
            403,
            "You do not have access to this organization"
        );
    }

    // const customerCount = await countCustomersInOrganization(orgId);

    console.log(`User ID: ${userId} requested details for Organization: ${org.name}`);

    return {
        ...org.toObject(),
        meta: getOrganizationMeta(org),
    };
};




export const updateOrganizationService = async (orgId, updateData, userId) => {
    if (!orgId) {
        throw new ApiError(400, "Organization ID is required");
    }
    if (!updateData) {
        throw new ApiError(400, "Data is required to update organization");
    }

    const { orgName, description } = updateData;
    console.log(updateData);

    const org = await findOrganizationById(orgId);
    if (!org) throw new ApiError(404, "Organization not found");

    if (org.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You do not have permission to update this organization");
    }

    let hasChanges = false;

    if (orgName) {
        const cleanedOrgName = orgName.trim();

        const nameError = organizationNameValidator(cleanedOrgName);
        if (!nameError.valid) {
            throw new ApiError(400, `Name is invalid: ${nameError.errors.join(", ")}`);
        }

        if (org.name !== cleanedOrgName) {
            org.name = cleanedOrgName[0].toUpperCase() + cleanedOrgName.slice(1);
            org.isSlugStale = true;
            hasChanges = true;
        }
    }

    // Update description only if it has changed
    if (description !== undefined) {
        const cleanedDescription = description.trim();

        if (org.description !== cleanedDescription) {
            org.description = cleanedDescription;
            hasChanges = true;
        }
    }

    if (!hasChanges) {
        throw new ApiError(400, "No changes detected.");
    }

    try {
        await org.save();
    } catch (err) {
        throw new ApiError(500, "Failed to update organization - please try again");
    }

    console.log(`Organization ${org.name} (ID: ${org._id}) updated by user ID: ${userId}`);

    return org;
};






export const deleteOrganizationService = async (userId, orgId) => {
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
        await unsetActiveOrganizationForUsers(orgId, session);

        await deleteOrganizationById(orgId, session);

        await session.commitTransaction();

        console.log(`Organization ${org.name} (ID: ${org._id}) deleted by user ID: ${userId}`);

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

    console.log(`User ${user.email} switched active organization to ${user.activeOrganization}`);

    return {
        success: true,
        userId: user._id,
        orgName: org.name,
        activeOrganization: user.activeOrganization,
    }
};








export const syncOrganizationSlugService = async (userId, orgId) => {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Invalid organization ID");
    }

    // check if user has access to the organization
    const org = await findOrganizationById(orgId);
    if (!org) {
        throw new ApiError(404, "Organization not found");
    }

    if (!org.isSlugStale) {
        throw new ApiError(400, "No syncronization required. Url is already up to date");
    }

    if (org.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not allowed to change this organization's URL/web address");
    }

    const newSlug = await generateOrgSlug(org.name);

    org.slug = newSlug;
    org.isSlugStale = false;

    try {
        await org.save();
    } catch (err) {
        if (err.code === 11000) { // Duplicate key error (e.g. unique index violation) to prevent race conditions
            throw new ApiError(409, "Slug conflict - another organization has the same slug. Please try renaming your organization to something more unique.");
        }
        throw new ApiError(500, "An error occurred while syncing the organization slug. Please try again.");
    }

    console.log(`Organization ${org.name} (ID: ${org._id}) slug synchronized to ${org.slug} by user ID: ${userId}`);

    return {
        success: true,
        message: "Organization slug synchronized successfully",
        slug: org.slug
    };
}

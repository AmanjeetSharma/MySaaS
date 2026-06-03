import mongoose from 'mongoose';
import { ApiError } from "../../utils/ApiError.js";
import {
    hasOrganizationAccess,
    createDeal,
    findCustomerByIdInOrg,
    checkUserOrganizationMembership,
    findDealById,
} from "./deal.repository.js";





export const createDealService = async (userId, payload) => {
    const { orgId, customerId, title } = payload;

    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Organization ID is required and must be valid");
    }
    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
        throw new ApiError(400, "Customer ID is required and must be valid");
    }

    // this will be checking for org existence and user membership in one go
    const isOrgExistAndAccessible = await hasOrganizationAccess(userId, orgId);
    if (!isOrgExistAndAccessible) {
        throw new ApiError(403, "Organization not found or access denied");
    }

    const customerExists = await findCustomerByIdInOrg(customerId, orgId);
    if (!customerExists) {
        throw new ApiError(404, "Customer not found in the organization");
    }

    let deal;
    try {
        deal = await createDeal(
            userId,
            orgId,
            customerId,
            title || "New Deal",
        );
    } catch (error) {
        console.error("Error creating deal:", error);
        throw new ApiError(500, "Failed to create deal, please try again");
    }

    console.log(`Deal created | Deal ID: ${deal._id} | Organization ID: ${orgId} | Created By: ${userId}`);

    return deal;
};











export const updateDealService = async (userId, dealId, title) => {
    if (!dealId || !mongoose.Types.ObjectId.isValid(dealId)) {
        throw new ApiError(400, "Deal ID is required and must be valid");
    }

    const deal = await findDealById(dealId);
    if (!deal) {
        throw new ApiError(404, "Deal not found");
    }

    const isMember = await checkUserOrganizationMembership(userId, deal.organization);
    if (!isMember) {
        throw new ApiError(403, "Access denied: You are not a member of the organization");
    }

    const normalizedTitle = title?.trim().replace(/\s+/g, ' '); // Normalize whitespace
    if (!normalizedTitle) {
        throw new ApiError(400, "Title cannot be empty");
    }
    if (deal.title === normalizedTitle) {
        throw new ApiError(400, "No changes detected");
    }

    deal.title = normalizedTitle;
    deal.updatedBy = userId;

    try {
        await deal.save();
    } catch (error) {
        console.error("Error updating deal:", error);
        throw new ApiError(500, "Failed to update deal, please try again");
    }

    console.log(`Deal updated | Deal ID: ${deal._id} | Organization ID: ${deal.organization} | Updated By: ${userId}`);

    return deal;
};










export const updateDealStatusService = async (userId, dealId, status) => {
    if (!dealId || !mongoose.Types.ObjectId.isValid(dealId)) {
        throw new ApiError(400, "Deal ID is required and must be valid");
    }

    if (!status) {
        throw new ApiError(400, "Status is required");
    }
    const normalizedStatus = status.trim().toLowerCase();

    const allowedStatuses = ["active", "won", "lost"];
    if (!allowedStatuses.includes(normalizedStatus)) {
        throw new ApiError(400, `Invalid status value. Allowed values are: ${allowedStatuses.join(", ")}`);
    }

    const deal = await findDealById(dealId);
    if (!deal) {
        throw new ApiError(404, "Deal not found");
    }

    const isMember = await checkUserOrganizationMembership(userId, deal.organization);
    if (!isMember) {
        throw new ApiError(403, "Access denied: You are not a member of the organization");
    }

    if (deal.status === normalizedStatus) {
        throw new ApiError(400, "No changes detected");
    }

    deal.status = normalizedStatus;
    if (normalizedStatus === "won" || normalizedStatus === "lost") {
        deal.closedAt = new Date();
    } else {
        deal.closedAt = null;
    }
    
    deal.updatedBy = userId;

    try {
        await deal.save();
    } catch (error) {
        console.error("Error updating deal status:", error);
        throw new ApiError(500, "Failed to update deal status, please try again");
    }

    console.log(`Deal status updated | Deal ID: ${deal._id} | Organization ID: ${deal.organization} | Updated By: ${userId} | New Status: ${normalizedStatus}`);

    return deal;
};







export const getDealByIdService = async (userId, dealId) => {
    if (!dealId || !mongoose.Types.ObjectId.isValid(dealId)) {
        throw new ApiError(400, "Deal ID is required and must be valid");
    }

    const deal = await findDealById(dealId);
    if (!deal) {
        throw new ApiError(404, "Deal not found");
    }

    const isMember = await checkUserOrganizationMembership(userId, deal.organization);
    if (!isMember) {
        throw new ApiError(403, "Access denied: You are not a member of the organization");
    }

    console.log(`Deal retrieved | Deal ID: ${deal._id} | Organization ID: ${deal.organization} | Retrieved By: ${userId}`);

    return deal;
};









export const deleteDealService = async (userId, dealId) => {
    if (!dealId || !mongoose.Types.ObjectId.isValid(dealId)) {
        throw new ApiError(400, "Deal ID is required and must be valid");
    }

    const deal = await findDealById(dealId);
    if (!deal) {
        throw new ApiError(404, "Deal not found");
    }

    const isMember = await checkUserOrganizationMembership(userId, deal.organization);
    if (!isMember) {
        throw new ApiError(403, "Access denied: You are not a member of the organization");
    }

    deal.isDeleted = true;
    deal.updatedBy = userId;
    deal.deletedAt = new Date();

    try {
        await deal.save();
    } catch (error) {
        console.error("Error deleting deal:", error);
        throw new ApiError(500, "Failed to delete deal, please try again");
    }
    console.log(`Deal deleted | Deal ID: ${deal._id} | Organization ID: ${deal.organization} | Deleted By: ${userId}`);

    return {
        message: "Deal deleted successfully",
        deletedDealId: deal._id,
        deletedAt: deal.deletedAt,
        deletedBy: userId
    };
};








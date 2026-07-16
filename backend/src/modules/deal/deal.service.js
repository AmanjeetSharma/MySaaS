import mongoose from 'mongoose';
import { ApiError } from "../../utils/ApiError.js";
import {
    getOrganizationAccessStatus,
    createDeal,
    findCustomerByIdInOrg,
    checkUserOrganizationMembership,
    findDealById,
    findDealByIdWithPopulate,
    findDeals,
    countDeals,
    getDealStatistics,
    findDealActivities,
} from "./deal.repository.js";
import { encodeCursor } from "../../utils/cursor.js";




export const createDealService = async (userId, payload) => {
    const { orgId, customerId, title } = payload;

    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Organization ID is required and must be valid");
    }
    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
        throw new ApiError(400, "Customer ID is required and must be valid");
    }

    // this will be checking for org existence and user membership in one go
    const { exists, hasAccess } = await getOrganizationAccessStatus(userId, orgId);
    if (!exists) {
        throw new ApiError(404, "Organization not found");
    }
    if (!hasAccess) {
        throw new ApiError(403, "Access denied: You are not a member of the organization");
    }

    const customerExists = await findCustomerByIdInOrg(customerId, orgId);
    if (!customerExists) {
        throw new ApiError(404, "Customer not found in the organization");
    }

    if (title && title.trim().length > 255) {
        throw new ApiError(400, "Title length cannot exceed 255 characters");
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
    console.log(dealId, title);
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
    if (normalizedTitle.length > 255) {
        throw new ApiError(400, "Title cannot exceed 255 characters");
    }

    deal.title = normalizedTitle;
    deal.updatedBy = userId;

    try {
        await deal.save();
    } catch (error) {
        console.error("Error updating deal:", error);
        throw new ApiError(500, error.message || "Failed to update deal, please try again");
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

    const deal = await findDealByIdWithPopulate(dealId);
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
        message: `Deal with title '${deal.title.length > 20 ? deal.title.slice(0, 20) + "..." : deal.title}' has been deleted`,
        deletedDealId: deal._id,
        deletedAt: deal.deletedAt,
        deletedBy: userId
    };
};









export const getAllDealsForOrganizationService = async (userId, orgId, query) => {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Invalid organization ID");
    }

    const isPartOfOrg = await checkUserOrganizationMembership(userId, orgId);
    if (!isPartOfOrg) {
        throw new ApiError(403, "Access denied: You are not a member of this organization");
    }

    const {
        page = 1,
        limit = 10,
        search, 
        status,
        sortBy = "latestInteractionAt",
        sortOrder = "desc"
    } = query;

    const baseFilter = {
        organization: orgId,
        isDeleted: false
    };

    const filter = { ...baseFilter };

    if (status) {
        const normalizedStatus = status.trim().toLowerCase();

        const allowedStatuses = ["active", "won", "lost"];

        if (!allowedStatuses.includes(normalizedStatus)) {
            throw new ApiError(400, `Invalid status filter. Allowed values are: ${allowedStatuses.join(", ")}`);
        }

        filter.status = normalizedStatus;
    }

    if (search?.trim()) {
        const safeSearch = search
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            .split(/\s+/)
            .join(".*");

        filter.$or = [
            {
                title: {
                    $regex: safeSearch,
                    $options: "i"
                }
            },
            {
                latestActivitySummary: {
                    $regex: safeSearch,
                    $options: "i"
                }
            }
        ];
    }

    // Pagination
    let pageNum = Number(page) || 1;
    let limitNum = Number(limit) || 10;
    pageNum = Math.max(1, pageNum);
    if (pageNum > 100) {
        throw new ApiError(400, "Page number exceeds maximum allowed limit");
    }
    limitNum = Math.min(50, Math.max(1, limitNum));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const allowedSortFields = [
        "createdAt",
        "updatedAt",
        "latestInteractionAt",
        "closedAt",
        "title"
    ];

    const finalSortField = allowedSortFields.includes(sortBy) ? sortBy : "latestInteractionAt";

    const sort = {
        [finalSortField]: sortOrder === "desc" ? -1 : 1
    };

    console.log(`--------\nPage: ${pageNum} | Limit: ${limitNum} | Skip: ${skip} | Sort: ${finalSortField} ${sortOrder}\nSearch: ${search || "N/A"} | Status: ${status || "ALL"}`);

    try {
        const [deals, filteredTotal, overallTotal, statistics] =
            await Promise.all([
                findDeals(
                    filter,
                    sort,
                    skip,
                    limitNum
                ),
                countDeals(filter),
                countDeals(baseFilter),
                getDealStatistics(baseFilter)
            ]);

        const statsMap = {
            active: 0,
            won: 0,
            lost: 0,
            total: overallTotal
        };

        statistics.forEach((stat) => {
            if (stat._id === "active") statsMap.active = stat.count;
            if (stat._id === "won") statsMap.won = stat.count;
            if (stat._id === "lost") statsMap.lost = stat.count;
        });

        console.log(`Deals retrieved | Organization: ${orgId} | RequestedBy: ${userId}\nCount: ${deals.length} | Total: ${filteredTotal} | Search: ${search || "N/A"} | Status: ${status || "ALL"} | Sort: ${finalSortField} ${sortOrder}`);

        return {
            organization: orgId,

            statistics: statsMap,

            deals,

            pagination: {
                page: pageNum,
                limit: limitNum,
                total: filteredTotal,
                overallTotal,
                totalPages: Math.ceil(filteredTotal / limitNum)
            }
        };
    } catch (error) {
        console.error("Failed to fetch organization deals:", error);

        throw new ApiError(
            500,
            error.message || "Failed to retrieve deals, please try again"
        );
    }
};









const PAGE_SIZE = 10;

export const getDealActivitiesService = async (userId, dealId, cursor = null) => {
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

    try {
        const results = await findDealActivities(dealId, cursor, PAGE_SIZE + 1);

        const hasMore = results.length > PAGE_SIZE;

        const activities = hasMore ? results.slice(0, PAGE_SIZE) : results;

        const lastActivity = activities.length > 0 ? activities[activities.length - 1] : null;

        return {
            activities,
            hasMore,
            nextCursor: hasMore ?
                encodeCursor({
                    createdAt: lastActivity.createdAt,
                    _id: lastActivity._id
                })
                : null
        };
    } catch (error) {
        console.error("Failed to fetch deal activities:", error);
        throw new ApiError(
            500,
            "Failed to retrieve deal activities, please try again"
        );
    }
};



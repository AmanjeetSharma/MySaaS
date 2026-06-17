import mongoose, { Types } from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import {
    checkUserOrganizationMembership,
    findDealById,
    createActivity,
    findActivityById,
    findActivityByIdWithDetails,
    deleteActivity,
    findUserById,
    getActivityFeed,
} from "./activity.repository.js";
import { ACTIVITY_TYPES } from "../../constants/activityTypes.constants.js";









export const createActivityService = async (
    userId,
    { dealId, type, event, description, customType = null }
) => {

    if (!dealId || !Types.ObjectId.isValid(dealId)) {
        throw new ApiError(400, "Valid dealId is required to create an activity");
    }

    const deal = await findDealById(dealId);
    if (!deal) {
        throw new ApiError(404, "Deal not found");
    }

    if (!ACTIVITY_TYPES.includes(type)) {
        throw new ApiError(400, "Invalid activity type");
    }

    if (type === "custom") {
        if (!customType || typeof customType !== "string" || customType.trim() === "") {
            throw new ApiError(400, "Please provide a valid customType");
        }
    }

    const isMember = await checkUserOrganizationMembership(userId, deal.organization);
    if (!isMember) {
        throw new ApiError(403, "Access denied: You do not belong to the organization");
    }

    const payload = {
        organization: deal.organization,
        customer: deal.customer,
        deal: dealId,
        type,
        event,
        description: description || null,
        customType: type === "custom" ? customType.trim() : null
    };

    let activity;
    try {
        activity = await createActivity(userId, payload);
    } catch (error) {
        console.error("Activity creation failed:", error);
        throw new ApiError(500, "An error occurred while creating the activity, please try again");
    }

    console.log(`Activity created | Type: '${type}' | Event: '${event}' | Deal: '${deal.title.substring(0, 20)}...'`);

    return {
        activity,
        message: `Activity of type '${type}' created successfully for deal '${deal.title.substring(0, 20)}...'`
    }
};











export const updateActivityService = async (
    userId,
    activityId,
    { type, event, description, customType = null }
) => {

    if (!activityId || !Types.ObjectId.isValid(activityId)) {
        throw new ApiError(400, "Activity ID is required and must be a valid ObjectId");
    }

    const activity = await findActivityById(activityId);
    if (!activity) {
        throw new ApiError(404, "Activity not found");
    }

    const isMember = await checkUserOrganizationMembership(userId, activity.organization);
    if (!isMember) {
        throw new ApiError(403, "Access denied: You do not belong to the organization");
    }

    if (type && !ACTIVITY_TYPES.includes(type)) {
        throw new ApiError(400, "Invalid activity type");
    }

    if (type === "custom" && (!customType || customType.trim().length === 0)) {
        throw new ApiError(400, "customType is required for custom activity");
    }


    if (type !== undefined) {
        activity.type = type;
    }

    if (event !== undefined) {
        if (typeof event !== "string" || event.trim().length === 0) {
            throw new ApiError(400, "Event must not be empty");
        }
        if (event.length > 250) {
            throw new ApiError(400, "Event cannot exceed 250 characters");
        }
        activity.event = event;
    }

    if (description !== undefined) {
        if (typeof description !== "string") {
            throw new ApiError(400, "Description must be a string");
        }
        if (description.length > 2000) {
            throw new ApiError(400, "Description cannot exceed 2000 characters");
        }
        activity.description = description;
    }

    if (type === "custom") {
        if (typeof customType !== "string") {
            throw new ApiError(400, "customType must be a string");
        }
        if (customType.trim().length > 50) {
            throw new ApiError(400, "Custom type cannot exceed 50 characters");
        }
        activity.customType = customType.trim();
    } else if (type !== undefined && type !== "custom") {
        activity.customType = null;
    }

    activity.updatedBy = userId;

    try {
        await activity.save();

        await activity.populate([
            {
                path: "createdBy",
                select: "name email"
            },
            {
                path: "updatedBy",
                select: "name email"
            }
        ]);
    } catch (error) {
        console.error("Activity update failed:", error);
        throw new ApiError(500, "Failed to update activity");
    }

    console.log(`Activity updated | Type: '${activity.type}' | Event: '${activity.event}' | ID: '${activity._id}'`);

    return {
        activity,
        message: `Activity updated successfully`
    }
};








export const deleteActivityService = async (userId, activityId) => {

    if (!activityId || !Types.ObjectId.isValid(activityId)) {
        throw new ApiError(400, "Activity ID is required and must be a valid ObjectId");
    }

    const activity = await findActivityById(activityId);
    if (!activity) {
        throw new ApiError(404, "Activity not found");
    }

    const isMember = await checkUserOrganizationMembership(userId, activity.organization);
    if (!isMember) {
        throw new ApiError(403, "Access denied: You do not belong to the organization");
    }

    try {
        await deleteActivity(activityId);
    } catch (error) {
        console.error("Activity deletion failed:", error);
        throw new ApiError(500, "An error occurred while deleting the activity, please try again");
    }

    console.log(`Activity deleted | Type: '${activity.type}' | Event: '${activity.event}' | ID: '${activity._id}'`);

    return {
        message: `Activity deleted | Type: '${activity.type}' | Event: '${activity.event}'`
    }
};









export const getActivityByIdService = async (userId, activityId) => {

    if (!activityId || !Types.ObjectId.isValid(activityId)) {
        throw new ApiError(400, "Activity ID is required and must be a valid ObjectId");
    }

    const activity = await findActivityByIdWithDetails(activityId);
    if (!activity) {
        throw new ApiError(404, "Activity not found");
    }

    const isMember = await checkUserOrganizationMembership(userId, activity.organization._id);
    if (!isMember) {
        throw new ApiError(403, "Access denied: You do not belong to the organization");
    }

    return {
        activity,
        message: "Activity retrieved successfully"
    }
};








export const getAllActivitiesService = async (userId, { cursor = null }) => {
    const user = await findUserById(userId, "activeOrganization");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user?.activeOrganization) {
        throw new ApiError(400, "Please set an active organization to view activities");
    }

    const activities = await getActivityFeed({
        organizationId: user.activeOrganization,
        limit: 2,
        cursor
    });

    const nextCursor = activities.length > 0 ? activities[activities.length - 1].createdAt : null;

    console.log(`Fetched ${activities.length} activities for user ${user.email} with cursor ${cursor}`);

    return {
        activities,
        nextCursor,
        hasMore: activities.length === 10,
        message: activities.length > 0 ? "Activities retrieved successfully" : "No more activities to display"
    }
};

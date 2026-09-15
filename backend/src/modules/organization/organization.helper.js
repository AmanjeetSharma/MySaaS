import { PLAN_LIMITS } from "../../constants/plan.constants.js";
import { ApiError } from "../../utils/ApiError.js";

export const getOrganizationMeta = (organization) => {

    if (!organization) return null;

    const planKey = organization.subscription?.plan || "free";

    const planConfig = PLAN_LIMITS[planKey] || PLAN_LIMITS.free;

    return {
        limits: {
            maxMembers: planConfig.limits?.maxMembers || 0,

            maxCustomers: planConfig.limits?.maxCustomers || 0,

            aiCredits: planConfig.limits?.aiCredits || 0,
        }
    };
};


export const checkMemberLimit = (org) => {
    const plan = org.subscription?.plan || "free";

    const planConfig = PLAN_LIMITS[plan];

    if (!planConfig) {
        throw new ApiError(500, "Invalid organization subscription plan");
    }

    const maxMembers = planConfig.limits.maxMembers;
    const currentMembers = (org.members?.length || 0) + 1;

    if (currentMembers >= maxMembers) {
        throw new ApiError(
            403,
            `Your ${planConfig.name} plan allows a maximum of ${maxMembers} members. Please upgrade your plan to add more members.`
        );
    }

    return {
        currentMembers,
        maxMembers,
        remainingMembers: maxMembers - currentMembers,
    };
};

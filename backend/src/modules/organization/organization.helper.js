import { PLAN_LIMITS } from "../../constants/plan.constants.js";

export const getOrganizationMeta = (organization) => {

    if (!organization) return null;

    const planKey =
        organization.subscription?.plan || "free";

    const planConfig =
        PLAN_LIMITS[planKey] || PLAN_LIMITS.free;

    return {
        limits: {
            maxMembers:
                planConfig.limits?.maxMembers || 0,

            maxCustomers:
                planConfig.limits?.maxCustomers || 0,

            aiCredits:
                planConfig.limits?.aiCredits || 0,
        }
    };
};
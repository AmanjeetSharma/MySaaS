import { PLAN_CONFIG } from "../../config/plan.config.js";

export const getOrganizationMeta = (organization) => {

    if (!organization) return null;

    const planKey =
        organization.subscription?.plan || "free";

    const planConfig =
        PLAN_CONFIG[planKey] || PLAN_CONFIG.free;

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
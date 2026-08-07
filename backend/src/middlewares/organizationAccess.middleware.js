import { asyncHandler } from "../utils/asyncHandler.js";
import { checkOrganizationAccess } from "../modules/organization/organization.access.js";


export const requireOrganizationAccess = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const organizationId =
        req.params.orgId ||
        req.params.organizationId ||
        req.body?.organizationId ||
        req.query.organizationId;

    const organization = await checkOrganizationAccess(
        userId,
        organizationId
    );

    req.organization = organization;

    next();
}
);

import { Organization } from "../../organization/organization.model.js";

export const getOrganizationOwner = (orgId) => {
    return Organization.findById(orgId)
        .select("_id owner")
        .lean();
};

export const updateGoogleIntegration = (orgId, integration) => {
    return Organization.findByIdAndUpdate(
        orgId,
        {
            $set: {
                "integrations.google": integration,
            },
        },
        {
            returnDocument: "after",
        }
    );
};

export const getOrganizationGoogleIntegration = (orgId) => {
    return Organization.findById(orgId)
        .select(
            "owner integrations.google.isConnected integrations.google.email integrations.google.connectedAt integrations.google.calendarId"
        )
        .lean();
};

export const getOrganizationGoogleCredentials = (orgId) => {
    return Organization.findById(orgId)
        .select(
            "owner integrations.google"
        )
        .lean();
};

export const disconnectGoogleIntegration = (orgId) => {
    return Organization.findByIdAndUpdate(
        orgId,
        {
            $unset: {
                "integrations.google": 1,// remove the entire google integration object
            },
        },
        {
            returnDocument: "after", // return the updated document
        }
    );
};
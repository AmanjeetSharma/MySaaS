import { Organization } from "../../organization/organization.model.js";


export const getOrganizationOwner = (orgId) => {
    return Organization.findById(orgId)
        .select("_id owner")
        .lean();

};


export const findOrganizationByZoomAccountId = (zoomAccountId) => {
    return Organization.findOne({
        "integrations.zoom.zoomAccountId": zoomAccountId,
        "integrations.zoom.isConnected": true,
    })
        .select("_id owner")
        .lean();
};


export const updateZoomIntegration = (orgId, integration) => {
    return Organization.findByIdAndUpdate(
        orgId,
        {
            $set: {
                "integrations.zoom": integration,
            },
        },
        {
            returnDocument: "after",
        }
    );
};


export const getOrganizationZoomIntegration = (orgId) => {
    return Organization.findById(orgId)
        .select(
            "owner integrations.zoom.isConnected integrations.zoom.email integrations.zoom.connectedAt members"
        )
        .lean();
};


export const getOrganizationZoomCredentials = (orgId) => {
    return Organization.findById(orgId)
        .select(
            "owner members integrations.zoom.isConnected integrations.zoom.email integrations.zoom.zoomAccountId integrations.zoom.connectedAt " +
            "+integrations.zoom.refreshToken.encryptedData " +
            "+integrations.zoom.refreshToken.iv " +
            "+integrations.zoom.refreshToken.authTag"
        )
        .lean();
};


export const disconnectZoomIntegration = (orgId) => {
    return Organization.findByIdAndUpdate(
        orgId,
        {
            $set: {
                "integrations.zoom": {
                    isConnected: false,
                    refreshToken: {
                        encryptedData: null,
                        iv: null,
                        authTag: null,
                    },
                    email: null,
                    zoomAccountId: null,
                    connectedAt: null,
                },
            },
        },
        {
            returnDocument: "after",
        }
    );
};
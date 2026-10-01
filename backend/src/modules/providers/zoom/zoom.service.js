import mongoose from "mongoose";
import axios from "axios";
import { ApiError } from "../../../utils/ApiError.js";
import env from "../../../config/env.config.js";
import {
    ZOOM_OAUTH_AUTH_URL,
    ZOOM_OAUTH_TOKEN_URL,
    ZOOM_API_BASE_URL,
    ZOOM_OAUTH_REVOKE_URL,
} from "./zoom.constants.js";
import {
    generateZoomOAuthState,
    verifyZoomOAuthState,
    encryptRefreshToken,
    decryptRefreshToken,
} from "./zoom.utils.js";
import {
    getOrganizationOwner,
    findOrganizationByZoomAccountId,
    updateZoomRefreshToken,
    updateZoomIntegration,
    getOrganizationZoomIntegration,
    getOrganizationZoomCredentials,
    disconnectZoomIntegration,
} from "./zoom.repository.js";
import logger from "#/config/logger.js";












export const connectZoomService = async ({
    userId,
    orgId,
}) => {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Invalid organization ID.");
    }

    const organization = await getOrganizationOwner(orgId);
    if (!organization) {
        throw new ApiError(404, "Organization not found.");
    }

    if (organization.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Access denied. Ask the organization owner to connect Zoom.");
    }

    const state = generateZoomOAuthState({
        userId,
        orgId,
    });

    const params = new URLSearchParams({
        response_type: "code",
        client_id: env.ZOOM_CLIENT_ID,
        redirect_uri: env.ZOOM_REDIRECT_URI,
        state,
    });

    const authUrl = `${ZOOM_OAUTH_AUTH_URL}?${params.toString()}`;

    logger.info(
        {
            orgId,
        },
        "integration.zoom.auth_url.generated"
    );

    return {
        authUrl,
    };
};














export const zoomOAuthCallbackService = async ({
    code,
    state,
}) => {
    if (!code || !state) {
        throw new ApiError(400, "Invalid Zoom OAuth callback.");
    }

    let payload;

    try {
        payload = verifyZoomOAuthState(state);
    } catch (error) {
        throw new ApiError(400, "Invalid or expired Zoom OAuth state.");
    }

    if (payload.type !== "zoom_oauth_state") {
        throw new ApiError(400, "Invalid Zoom OAuth state.");
    }

    const { userId, orgId } = payload;

    if (!userId || !orgId) {
        throw new ApiError(400, "Invalid Zoom OAuth state.");
    }

    const organization = await getOrganizationOwner(orgId);
    if (!organization) {
        throw new ApiError(404, "Organization not found.");
    }

    if (organization.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Access denied.");
    }

    let tokenResponse;

    try {
        const credentials = Buffer.from(`${env.ZOOM_CLIENT_ID}:${env.ZOOM_CLIENT_SECRET}`).toString("base64");

        tokenResponse = await axios.post(
            ZOOM_OAUTH_TOKEN_URL,
            new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: env.ZOOM_REDIRECT_URI,
            }).toString(),
            {
                headers: {
                    Authorization: `Basic ${credentials}`,
                    "Content-Type":
                        "application/x-www-form-urlencoded",
                },
            }
        );
    } catch (error) {
        logger.error(
            {
                orgId,
                error: error.response?.data || error.message,
            },
            "integration.zoom.oauth.token_exchange_failed"
        );

        throw new ApiError(400, "Failed to connect Zoom.");
    }

    const {
        access_token: accessToken,
        refresh_token: refreshToken,
    } = tokenResponse.data;

    if (!accessToken || !refreshToken) {
        throw new ApiError(400, "Zoom authorization did not return required tokens.");
    }

    let zoomUser;

    try {
        const response = await axios.get(`${ZOOM_API_BASE_URL}/users/me`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        zoomUser = response.data;
    } catch (error) {
        logger.error(
            {
                orgId,
                error: error.response?.data || error.message,
            },
            "integration.zoom.user_fetch_failed"
        );

        throw new ApiError(400, "Failed to retrieve Zoom account information.");
    }

    if (!zoomUser?.id || !zoomUser?.email) {
        throw new ApiError(400, "Invalid Zoom account information.");
    }

    const encryptedRefreshToken = encryptRefreshToken(refreshToken);

    const existingOrganization = await findOrganizationByZoomAccountId(zoomUser.id);

    if (existingOrganization && existingOrganization._id.toString() !== orgId.toString()) {

        const updatedOrganization = await updateZoomRefreshToken(existingOrganization._id, encryptedRefreshToken);
        if (updatedOrganization) {
            logger.info(
                {
                    orgId,
                    existingOrgId: existingOrganization._id,
                    zoomAccountId: zoomUser.id,
                },
                "integration.zoom.refresh_token_updated"
            );
        }

        logger.warn(
            {
                orgId,
                existingOrgId: existingOrganization._id,
                zoomAccountId: zoomUser.id,
            },
            "integration.zoom.account_already_connected"
        );

        throw new ApiError(400, "Your active Zoom account is already connected to another organization. Please switch to a different Zoom accounts and try again.");
    }

    const connectedAt = new Date();

    await updateZoomIntegration(
        orgId,
        {
            isConnected: true,
            refreshToken: encryptedRefreshToken,
            email: zoomUser.email,
            zoomAccountId: zoomUser.id,
            connectedAt,
        }
    );

    logger.info(
        {
            orgId,
            zoomAccountId: zoomUser.id,
        },
        "integration.zoom.connected"
    );

    return {
        email: zoomUser.email,
        connectedAt,
    };
};













export const getZoomIntegrationStatusService = async ({
    userId,
    orgId,
}) => {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Invalid organization ID.");
    }

    const organization = await getOrganizationZoomIntegration(orgId);

    if (!organization) {
        throw new ApiError(404, "Organization not found.");
    }

    const isOwner = organization.owner.toString() === userId.toString();

    const isMember = organization.members.some(
        (member) => member.user.toString() === userId.toString()
    );

    if (!isOwner && !isMember) {
        throw new ApiError(403, "Access denied. You are not a part of this organization.");
    }

    const zoomIntegration = organization.integrations?.zoom;

    logger.info(
        {
            orgId,
            email: zoomIntegration?.email ?? null,
        },
        "integration.zoom.status"
    );

    return {
        isConnected: zoomIntegration?.isConnected ?? false,
        email: zoomIntegration?.email ?? null,
        connectedAt: zoomIntegration?.connectedAt ?? null,
    };
};














const getZoomBasicAuth = () => {
    return Buffer.from(`${env.ZOOM_CLIENT_ID}:${env.ZOOM_CLIENT_SECRET}`).toString("base64");
};

const refreshZoomAccessToken = async (refreshToken) => {
    try {
        const response = await axios.post(
            ZOOM_OAUTH_TOKEN_URL,
            new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }).toString(),
            {
                headers: {
                    Authorization: `Basic ${getZoomBasicAuth()}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        if (!response.data?.access_token) {
            throw new Error("Zoom did not return an access token.");
        }

        return response.data.access_token;
    } catch (error) {
        logger.error(
            {
                error: error.response?.data || error.message,
            },
            "integration.zoom.access_token_refresh_failed"
        );

        throw new ApiError(401, "Zoom authorization has expired. Please reconnect your Zoom account.");
    }
};

const revokeZoomAccessToken = async (accessToken) => {
    try {
        await axios.post(
            ZOOM_OAUTH_REVOKE_URL,
            new URLSearchParams({
                token: accessToken,
            }).toString(),
            {
                headers: {
                    Authorization: `Basic ${getZoomBasicAuth()}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );
    } catch (error) {
        logger.error(
            {
                error: error.response?.data || error.message,
            },
            "integration.zoom.token_revoke_failed"
        );

        throw new ApiError(502, "Failed to revoke Zoom authorization.");
    }
};




export const disconnectZoomService = async ({
    userId,
    orgId,
}) => {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Invalid organization ID.");
    }

    const organization = await getOrganizationZoomCredentials(orgId);
    if (!organization) {
        throw new ApiError(404, "Organization not found.");
    }

    if (organization.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Access denied. Only the organization owner can disconnect Zoom.");
    }

    if (!organization.integrations?.zoom?.isConnected) {
        throw new ApiError(400, "Zoom account is not connected.");
    }

    let refreshToken;

    try {
        refreshToken = decryptRefreshToken(
            organization.integrations.zoom.refreshToken
        );
    } catch (error) {
        logger.error(
            {
                orgId,
                error: error.message,
            },
            "integration.zoom.refresh_token_decryption_failed"
        );

        throw new ApiError(500, "Unable to process Zoom authorization.");
    }

    const accessToken = await refreshZoomAccessToken(refreshToken);

    await revokeZoomAccessToken(accessToken);

    const result = await disconnectZoomIntegration(orgId);
    if (!result) {
        throw new ApiError(500, "Failed to disconnect Zoom integration.");
    }

    logger.info(
        {
            orgId,
            email: organization.integrations.zoom.email,
            zoomAccountId: organization.integrations.zoom.zoomAccountId,
        },
        "integration.zoom.disconnected"
    );

    return {
        disconnected: true,
    };
};
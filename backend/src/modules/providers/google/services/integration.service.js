
import mongoose from "mongoose";
import { google } from "googleapis";
import { ApiError } from "../../../../utils/ApiError.js";
import { createGoogleOAuthClient } from "../google.client.js";
import { GOOGLE_SCOPES } from "../google.constants.js";
import { getGoogleCalendarClient } from "./calendar.service.js";
import {
    generateGoogleOAuthState,
    verifyGoogleOAuthState,
    encryptRefreshToken,
    decryptRefreshToken,
} from "../google.utils.js";
import {
    getOrganizationOwner,
    updateGoogleIntegration,
    getOrganizationGoogleIntegration,
    getOrganizationGoogleCredentials,
    disconnectGoogleIntegration,
    updateSelectedCalendar,
} from "../google.repository.js";





export const connectGoogleService = async ({
    userId,
    orgId
}) => {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Invalid organization ID");
    }
    const organization = await getOrganizationOwner(orgId);
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    if (organization.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Access denied. Ask the organization owner to connect Google account.");
    }

    const oauthClient = createGoogleOAuthClient();
    const state = generateGoogleOAuthState({ userId, orgId });

    const authUrl = oauthClient.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: GOOGLE_SCOPES,
        state,
    });

    return {
        authUrl,
    };
}











export const googleOAuthCallbackService = async ({
    code,
    state
}) => {
    if (!code || !state) {
        throw new ApiError(400, "Google authorization failed.");
    }

    const payload = verifyGoogleOAuthState(state);

    if (payload.type !== "google_oauth_state") {
        throw new ApiError(401, "Invalid OAuth state.");
    }

    const oauthClient = createGoogleOAuthClient();

    let tokenResponse;
    try {
        tokenResponse = await oauthClient.getToken(code);
    } catch {
        throw new ApiError(400, "Google authorization code is invalid or has expired.");
    }

    const { tokens } = tokenResponse;

    if (!tokens.refresh_token) {
        throw new ApiError(400, "Google did not return a refresh token. Please disconnect the app from your Google Account and try again.");
    }

    const encryptedRefreshToken = encryptRefreshToken(tokens.refresh_token);

    oauthClient.setCredentials(tokens);

    const oauth2 = google.oauth2({
        auth: oauthClient,
        version: "v2",
    });

    const { data: googleUser } = await oauth2.userinfo.get();

    if (!googleUser || !googleUser.id || !googleUser.email) {
        throw new ApiError(400, "Unable to retrieve Google account information. Please try again.");
    }

    const calendar = getGoogleCalendarClient(
        tokens.refresh_token
    );

    const { data: calendarList } = await calendar.calendarList.list();

    if (!calendarList?.items?.length) {
        throw new ApiError(500, "No Google calendars were found for this account.");
    }

    const primaryCalendar = calendarList.items.find(
        (item) => item.primary
    );

    if (!primaryCalendar) {
        throw new ApiError(500, "Primary Google Calendar could not be found.");
    }

    const organization = await updateGoogleIntegration(
        payload.orgId,
        {
            isConnected: true,
            email: googleUser.email,
            googleAccountId: googleUser.id,
            refreshToken: encryptedRefreshToken,
            calendarId: primaryCalendar.id,
            calendarName: primaryCalendar.summary,
            calendarDescription: primaryCalendar.description ?? null,
            connectedAt: new Date(),
        }
    );

    if (!organization) {
        throw new ApiError(500, "Failed to update Google integration.");
    }

    return {
        email: googleUser.email,
        connectedAt: organization.integrations.google.connectedAt,
    };
};










export const updateSelectedCalendarService = async ({
    userId,
    orgId,
    calendarId,
}) => {

    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Organization ID is required and must be a valid ObjectId.");
    }

    if (!calendarId?.trim()) {
        throw new ApiError(400, "Calendar ID is required.");
    }

    const organization = await getOrganizationGoogleCredentials(orgId);
    if (!organization) {
        throw new ApiError(404, "Organization not found.");
    }

    if (organization.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Access denied. Only the organization owner can update calendar.");
    }

    if (!organization.integrations.google.isConnected) {
        throw new ApiError(400, "Please connect a Google account before selecting a calendar.");
    }

    if (organization.integrations.google.calendarId === calendarId) {
        throw new ApiError(400, "You’re already using this as your active calendar.");
    }

    const refreshToken = decryptRefreshToken(
        organization.integrations.google.refreshToken
    );

    const calendar = getGoogleCalendarClient(refreshToken);

    const { data } = await calendar.calendarList.list();

    if (!data?.items) {
        throw new ApiError(500, "Failed to fetch Google Calendar list.");
    }

    const selectedCalendar = data.items.find(
        (item) => item.id === calendarId
    );

    if (!selectedCalendar) {
        throw new ApiError(400, "Selected calendar does not exist.");
    }
    
    if (!["owner", "writer"].includes(selectedCalendar.accessRole)) {
        throw new ApiError(400, "Selected calendar does not have permission to create appointments.");
    }

    const result = await updateSelectedCalendar(orgId, {
        calendarId: selectedCalendar.id,
        summary: selectedCalendar.summary,
        description: selectedCalendar.description ?? null,
    });
    if (!result) {
        throw new ApiError(500, "Failed to update calendar.");
    }

    return {
        calendarId: selectedCalendar.id,
        summary: selectedCalendar.summary,
        description: selectedCalendar.description ?? null,
    };
};









export const getGoogleIntegrationStatusService = async ({
    userId,
    orgId,
}) => {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Invalid organization ID.");
    }

    const organization = await getOrganizationGoogleIntegration(orgId);
    if (!organization) {
        throw new ApiError(404, "Organization not found.");
    }

    if (organization.owner.toString() !== userId.toString() &&
        !organization.members.some(member => member.user.toString() === userId.toString())) {
        throw new ApiError(403, "Access denied. You are not a part of this organization.");
    }

    const googleIntegration = organization.integrations?.google;

    return {
        isConnected: googleIntegration?.isConnected ?? false,
        email: googleIntegration?.email ?? null,
        connectedAt: googleIntegration?.connectedAt ?? null,
        calendarId: googleIntegration?.calendarId ?? null,
    };
};







export const listGoogleCalendarsService = async ({
    userId,
    orgId,
}) => {

    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Invalid organization ID.");
    }

    const organization = await getOrganizationGoogleCredentials(orgId);
    if (!organization) {
        throw new ApiError(404, "Organization not found.");
    }

    const isOwner = organization.owner.toString() === userId.toString();
    const isMember = organization.members.some(member => member.user.toString() === userId.toString());

    if (!isOwner && !isMember) {
        throw new ApiError(403, "Access denied. You are not a part of this organization.");
    }

    if (!organization.integrations.google.isConnected) {
        throw new ApiError(400, "Google account is not connected.");
    }

    const refreshToken = decryptRefreshToken(organization.integrations.google.refreshToken);

    const calendar = getGoogleCalendarClient(refreshToken);

    const { data } = await calendar.calendarList.list();

    if (!data?.items?.length) {
        throw new ApiError(500, "Failed to fetch Google calendars.");
    }

    if (isOwner) {
        const calendars = data.items
            .filter(item =>
                ["owner", "writer"].includes(item.accessRole)
            )
            .map(item => ({
                id: item.id,
                name: item.summary,
                description: item.description ?? null,
                primary: item.primary ?? false,
                selected:
                    item.id === organization.integrations.google.calendarId,
            }));

        return calendars;
    }

    const selectedCalendar = data.items.find(
        item => item.id === organization.integrations.google.calendarId
    );

    if (!selectedCalendar) {
        throw new ApiError(404, "The selected Google Calendar no longer exists or is no longer accessible.");
    }

    return [
        {
            id: selectedCalendar.id,
            name: selectedCalendar.summary,
            description: selectedCalendar.description ?? null,
            selected: true,
        },
    ];
};









export const disconnectGoogleService = async ({
    userId,
    orgId,
}) => {

    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Invalid organization ID.");
    }

    const organization = await getOrganizationGoogleCredentials(orgId);
    if (!organization) {
        throw new ApiError(404, "Organization not found.");
    }

    if (organization.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Access denied. Only the organization owner can disconnect Google.");
    }

    if (!organization.integrations.google.isConnected) {
        throw new ApiError(400, "Google account is not connected.");
    }

    const refreshToken = decryptRefreshToken(organization.integrations.google.refreshToken);

    const oauthClient = createGoogleOAuthClient();

    oauthClient.setCredentials({
        refresh_token: refreshToken,
    });

    try {
        await oauthClient.revokeCredentials();
    } catch (error) {
        console.error("[Google OAuth] Failed to revoke credentials:", {
            organizationId: orgId, error: error.message
        });
    }

    const result = await disconnectGoogleIntegration(orgId);
    if (!result) {
        throw new ApiError(500, "Failed to disconnect Google integration.");
    }

    return {
        disconnected: true,
    };
};


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
        throw new ApiError(403, "Only Organization owner can connect Google account");
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
        throw new ApiError(
            400,
            "Google did not return a refresh token. Please disconnect the app from your Google Account and try again."
        );
    }

    const encryptedRefreshToken = encryptRefreshToken(tokens.refresh_token);

    oauthClient.setCredentials(tokens);

    const oauth2 = google.oauth2({
        auth: oauthClient,
        version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    if (!data || !data.id || !data.email) {
        throw new ApiError(400, "Unable to retrieve Google account information. Please try again.");
    }

    const organization = await updateGoogleIntegration(
        payload.orgId,
        {
            googleAccountId: data.id,
            isConnected: true,
            refreshToken: encryptedRefreshToken,
            email: data.email,
            googleId: data.id,
            connectedAt: new Date(),
            calendarId: "primary",
        }
    );

    if (!organization) {
        throw new ApiError(404, "Failed to update Google integration.");
    }

    return {
        email: data.email,
        connectedAt: new Date(),
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
        throw new ApiError(403, "Only the organization owner can change the selected calendar.");
    }

    if (!organization.integrations.google.isConnected) {
        throw new ApiError(400, "Please connect a Google account before selecting a calendar.");
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

    const result = await updateSelectedCalendar(orgId, calendarId);
    if (!result) {
        throw new ApiError(500, "Failed to update calendar.");
    }

    return {
        calendarId: selectedCalendar.id,
        summary: selectedCalendar.summary,
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

    if (organization.owner.toString() !== userId.toString() &&
        !organization.members.some(member => member.user.toString() === userId.toString())) {
        throw new ApiError(403, "Access denied. You are not a part of this organization.");
    }

    if (!organization.integrations.google.isConnected) {
        throw new ApiError(400, "Google account is not connected.");
    }

    const refreshToken = decryptRefreshToken(organization.integrations.google.refreshToken);

    const oauthClient = createGoogleOAuthClient();

    oauthClient.setCredentials({
        refresh_token: refreshToken,
    });

    const calendar = google.calendar({
        version: "v3",
        auth: oauthClient,
    });

    const { data } = await calendar.calendarList.list();

    const calendars = await Promise.all(
        data.items.map(async (item) => {
            const { data: calendarData } = await calendar.calendars.get({
                calendarId: item.id,
            });

            return {
                id: calendarData.id,
                name: calendarData.summary,
                description: calendarData.description ?? null,
                primary: item.primary,
                accessRole: item.accessRole,
            };
        })
    );

    console.log(calendars);

    return data.items.map((calendar) => ({
        id: calendar.id,
        name: calendar.summary,
        description: calendar.description || null,
        primary: calendar.primary || false,
        accessRole: calendar.accessRole || null,
    }));
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
        throw new ApiError(403, "Only the organization owner can disconnect Google.");
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

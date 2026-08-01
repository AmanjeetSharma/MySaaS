import crypto from "crypto";
import { google } from "googleapis";
import { ApiError } from "../../../../utils/ApiError.js";
import { createGoogleOAuthClient } from "../google.client.js";







export const getGoogleCalendarClient = (refreshToken) => {
    const oauthClient = createGoogleOAuthClient();

    oauthClient.setCredentials({
        refresh_token: refreshToken,
    });

    return google.calendar({
        version: "v3",
        auth: oauthClient,
    });
};











export const createCalendarEvent = async ({
    refreshToken,
    calendarId = "primary",
    summary,
    description = "",
    startTime,
    endTime,
    timeZone,
    attendees = [],
    generateMeetLink = false,
    sendUpdates = "all",
}) => {
    try {
        if (!refreshToken) {
            throw new ApiError(400, "Refresh token is required.");
        }

        const calendar = getGoogleCalendarClient(refreshToken);

        const event = {
            summary,

            description,

            start: {
                dateTime: startTime,
                timeZone,
            },

            end: {
                dateTime: endTime,
                timeZone,
            },

            attendees,
        };

        if (generateMeetLink) {
            event.conferenceData = {
                createRequest: {
                    requestId: crypto.randomUUID(),
                },
            };
        }

        const { data } = await calendar.events.insert({
            calendarId,

            requestBody: event,

            conferenceDataVersion: generateMeetLink ? 1 : 0,

            sendUpdates,
        });

        if (!data || !data.id) {
            throw new ApiError(500, "Failed to create Google Calendar event.");
        }

        const meetLink = data.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ?? null;

        return {
            eventId: data.id,
            htmlLink: data.htmlLink,
            meetLink,
        };

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            "Failed to create Google Calendar event."
        );
    }
};











export const updateCalendarEvent = async ({
    refreshToken,
    calendarId = "primary",
    eventId,
    summary,
    description = "",
    startTime,
    endTime,
    timeZone,
    attendees = [],
    sendUpdates = "all",
}) => {
    try {
        if (!refreshToken) {
            throw new ApiError(400, "Refresh token is required.");
        }

        if (!eventId) {
            throw new ApiError(400, "Event ID is required.");
        }

        const calendar = getGoogleCalendarClient(refreshToken);

        const event = {
            summary,

            description,

            start: {
                dateTime: startTime,
                timeZone,
            },

            end: {
                dateTime: endTime,
                timeZone,
            },

            attendees,
        };

        const { data } = await calendar.events.update({
            calendarId,

            eventId,

            requestBody: event,

            sendUpdates,
        });

        if (!data || !data.id) {
            throw new ApiError(500, "Failed to update Google Calendar event.");
        }

        const meetLink = data.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ?? null;

        return {
            eventId: data.id,
            htmlLink: data.htmlLink,
            meetLink,
        };

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            "Failed to update Google Calendar event."
        );
    }
};










export const deleteCalendarEvent = async ({
    refreshToken,
    calendarId = "primary",
    eventId,
    sendUpdates = "all",
}) => {
    try {
        if (!refreshToken) {
            throw new ApiError(400, "Refresh token is required.");
        }

        if (!eventId) {
            throw new ApiError(400, "Event ID is required.");
        }

        const calendar = getGoogleCalendarClient(refreshToken);

        await calendar.events.delete({
            calendarId,
            eventId,
            sendUpdates,
        });

        return {
            success: true,
        };

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(500, "Failed to delete Google Calendar event.");
    }
};
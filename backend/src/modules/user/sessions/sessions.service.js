import mongoose from "mongoose";
import { ApiError } from "../../../utils/ApiError.js";
import { getUserById } from "../user.repository.js";
import logger from "#/config/logger.js";


export const getUserSessionsService = async (userId, currentSessionId) => {
    const user = await getUserById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    logger.info(
        {
            name: user.name,
            email: user.email,
            sessionCount: user.sessions.length,
        },
        "user.sessions_retrieved"
    );

    return {
        name: user.name,
        email: user.email,
        sessions: user.sessions,
        currentSessionId
    };
};






export const logoutSessionByIdService = async (userId, sessionId) => {
    if (!sessionId && !mongoose.Types.ObjectId.isValid(sessionId)) {
        throw new ApiError(400, "Session ID is Invalid");
    }
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!sessionId) {
        throw new ApiError(400, "Session is not valid");
    }

    // restrict user from logging out of current session using this endpoint
    if (String(user.sessionId) === String(sessionId)) {
        throw new ApiError(400, "Cannot log out of current session using this endpoint. Use 'Logout from all devices' option instead.");
    }

    const session = user.sessions.find(s => s.sessionId === sessionId); // Finding the session by sessionId

    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    if (!session.isActive) {
        throw new ApiError(400, "Session is already inactive");
    }

    session.isActive = false;
    session.refreshToken = null;

    await user.save();

    logger.info(
        {
            userId: user._id,
            sessionId,
            device: session.device
        },
        "user.session_invalidated"
    );

    return {
        name: user.name,
        email: user.email,
        message: `Session ${sessionId} logged out successfully`,
        device: session.device,
    };
};









export const logoutAllSessionsService = async (userId, currentSessionId) => {
    if (!currentSessionId) {
        throw new ApiError(400, "Session ID is required");
    }

    const user = await getUserById(userId);

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    const currentSession = user.sessions.find(
        (session) => String(session.sessionId) === String(currentSessionId)
    );

    if (!currentSession) {
        throw new ApiError(401, "Current session invalid or expired");
    }

    //Check if there are other active sessions
    const otherActiveSessions = user.sessions.filter(
        (session) =>
            String(session.sessionId) !== String(currentSessionId) &&
            session.isActive
    );

    if (otherActiveSessions.length === 0) {
        throw new ApiError(400, "No other active sessions found");
    }

    // Deactivate all other sessions except current
    for (const session of user.sessions) {
        if (String(session.sessionId) !== String(currentSessionId)) {
            session.isActive = false;
            session.refreshToken = null;
        }
    }

    await user.save();

    logger.info(
        {
            userId: user._id,
            email: user.email,
            currentDevice: currentSession.device
        },
        "user.logged_out_all_sessions"
    );

    return {
        message: "Logged out from all other devices successfully",
        email: user.email,
        currentDevice: currentSession.device,
        loggedOutDevices: otherActiveSessions.map(s => s.device)
    };
};



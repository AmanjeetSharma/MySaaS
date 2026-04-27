import { ApiError } from "../../../utils/ApiError.js";
import { getUserById } from "../user.repository.js";



export const getUserSessionsService = async (userId) => {
    if (!userId) {
        throw new ApiError(400, "Unauthorized");
    }
    const user = await getUserById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    console.log(`User sessions fetched | name: ${user.name}, email: ${user.email}, sessions: ${user.sessions.length}`);

    return {
        name: user.name,
        email: user.email,
        sessions: user.sessions
    };
};






export const logoutSessionByIdService = async (userId, sessionId) => {
    if (!userId) {
        throw new ApiError(400, "Unauthorized");
    }
    const user = await getUserById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
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

    console.log(`Session invalidated | user: ${user.email} | sessionId: ${sessionId}`);

    return {
        name: user.name,
        email: user.email,
        message: `Session ${sessionId} logged out successfully`
    }; d
};









export const logoutAllSessionsService = async (userId, currentSessionId) => {

    if (!userId) {
        throw new ApiError(400, "Unauthorized");
    }
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
    user.sessions = user.sessions.map((session) => {
        if (String(session.sessionId) === String(currentSessionId)) {
            return session; // keep current session active
        }

        return {
            ...session,
            isActive: false,
            refreshToken: null,
        };
    });

    await user.save();

    console.log(`User logged out from all other devices | Email: ${user.email} | Current Device: ${currentSession.device}`);

    return {
        message: "Logged out from all other devices successfully",
        email: user.email,
        currentDevice: currentSession.device,
        loggedOutDevices: otherActiveSessions.map(s => s.device)
    };
};



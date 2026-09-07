import jwt from "jsonwebtoken";
import { User } from "#/modules/user/user.model.js";
import env from "#/config/env.config.js";

export const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.headers.cookie?.split("; ")
            .find(cookie => cookie.startsWith("accessToken="))?.split("=")[1];

        if (!token) {
            return next(new Error("No access token provided"));
        }

        let decoded;

        try {
            decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            return next(new Error("Invalid or expired token"));
        }

        const user = await User.findById(decoded._id).select("+sessions");
        if (!user) {
            return next(new Error("User not found"));
        }

        if (user.accountStatus !== "active") {
            return next(new Error("Account is not active"));
        }

        const session = user.sessions.find(
            s => s.sessionId === decoded.sessionId && s.isActive
        );

        if (!session) {
            return next(new Error("Session expired or logged out"));
        }

        socket.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            sessionId: decoded.sessionId,
        };

        next();
    } catch (error) {
        next(new Error("Socket authentication failed"));
    }
};
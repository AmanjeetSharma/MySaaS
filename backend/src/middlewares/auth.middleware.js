import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../modules/user/user.model.js";
import env from "../config/env.config.js";




export const verifyToken = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new ApiError(401, "No access token");

    let decoded;

    try {
        decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        console.error("Auth middleware error:", err); // debug log
        throw new ApiError(401, "Invalid or expired token");
    }

    const user = await User.findById(decoded._id).select("+sessions");

    if (user.accountStatus !== "active") {
        throw new ApiError(403, `Your account is ${user.accountStatus}. Please contact support for assistance.`);
    }

    if (!user) throw new ApiError(404, "User not found");

    const session = user.sessions.find(
        s => s.sessionId === decoded.sessionId && s.isActive
    );

    if (!session) {
        throw new ApiError(401, "Session expired or logged out");
    }

    req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        sessionId: decoded.sessionId
    };

    next();
});

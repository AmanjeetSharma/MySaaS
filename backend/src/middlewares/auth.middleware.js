import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../modules/user/user.model.js";
import env from "../config/env.js";




export const verifyToken = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "No access token");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        console.log(`Auth middleware: ${err.message}`); // Debug log
        throw new ApiError(401, "Invalid or expired token");
    }

    const user = await User.findById(decoded._id).select("+sessions.refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
        const session = user.sessions.find(
            (s) => s.refreshToken === refreshToken && s.isActive
        );

        if (!session) {
            throw new ApiError(401, "Session expired or logged out");
        }
    }

    req.user = {
        _id: user._id,
        avatar: user.avatar,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus,
        activeOrganization: user.activeOrganization,
    }
    next();
});
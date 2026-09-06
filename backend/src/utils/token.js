import crypto from "crypto";
import jwt from "jsonwebtoken";
import env from "../config/env.config.js";
import logger from "../config/logger.js";


export const generateToken = () => {
    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const expiry = Date.now() + 10 * 60 * 1000; // 10 min

    return {
        rawToken,
        hashedToken,
        expiry
    };
};



export const generateSessionId = () => {
    return crypto.randomBytes(32).toString("hex");
};



export const generateAccessToken = (user, sessionId) => {

    logger.info(
        {
            module: "auth",
            expiresIn: env.ACCESS_TOKEN_EXPIRY || "15m",
        },
        "Access token generated"
    );

    return jwt.sign(
        {
            _id: user._id,
            email: user.email,
            name: user.name,
            sessionId
        },
        env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: env.ACCESS_TOKEN_EXPIRY || "15m",
        }
    );
};



export const generateRefreshToken = (userId, sessionId) => {

    logger.info(
        {
            module: "auth",
            expiresIn: env.REFRESH_TOKEN_EXPIRY || "7d",
        },
        "Refresh token generated"
    );

    return jwt.sign(
        {
            id: userId,
            sessionId
        },
        env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: env.REFRESH_TOKEN_EXPIRY || "7d",
        }
    );
};



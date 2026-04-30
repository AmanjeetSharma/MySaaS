import crypto from "crypto";
import jwt from "jsonwebtoken";
import env from "../config/env.config.js";


export const generateToken = () => {
    // raw token (send in email)
    const rawToken = crypto.randomBytes(32).toString("hex");

    // hashed token (store in DB)
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
    console.log("access token expires in:", env.ACCESS_TOKEN_EXPIRY || "15m");
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
    console.log("refresh token expires in:", env.REFRESH_TOKEN_EXPIRY || "7d");
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



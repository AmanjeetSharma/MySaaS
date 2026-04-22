import crypto from "crypto";
import jwt from "jsonwebtoken";


export const generateEmailVerificationToken = () => {
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
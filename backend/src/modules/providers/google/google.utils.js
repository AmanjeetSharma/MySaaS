import crypto from "crypto";
import jwt from "jsonwebtoken";
import env from "../../../config/env.config.js";



export const generateGoogleOAuthState = ({ userId, orgId }) => {
    return jwt.sign(
        {
            userId,
            orgId,
            type: "google_oauth_state",
        },
        env.GOOGLE_OAUTH_STATE_SECRET,
        {
            expiresIn: env.GOOGLE_OAUTH_STATE_EXPIRY,
        }
    );
};


export const verifyGoogleOAuthState = (state) => {
    return jwt.verify(
        state,
        env.GOOGLE_OAUTH_STATE_SECRET
    );
};


const ALGORITHM = "aes-256-gcm";

const ENCRYPTION_KEY = Buffer.from(
    env.GOOGLE_REFRESH_TOKEN_ENCRYPTION_KEY,
    "hex"
);

export const encryptRefreshToken = (refreshToken) => {
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
        ALGORITHM,
        ENCRYPTION_KEY,
        iv
    );

    const encrypted = Buffer.concat([
        cipher.update(refreshToken, "utf8"),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return {
        encryptedData: encrypted.toString("hex"),
        iv: iv.toString("hex"),
        authTag: authTag.toString("hex"),
    };
};

export const decryptRefreshToken = ({
    encryptedData,
    iv,
    authTag,
}) => {

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        ENCRYPTION_KEY,
        Buffer.from(iv, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedData, "hex")),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
};
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
import { google } from "googleapis";
import env from "../../../config/env.config.js";

export const createGoogleOAuthClient = () => {
    return new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        env.GOOGLE_REDIRECT_URI
    );
};
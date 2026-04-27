import env from "./env.config.js";

export const getCookieOptions = (type = "access") => {
    const isProduction = process.env.NODE_ENV === "production";
    // console.log("Cookie Options - isProduction:", isProduction); // debug log to verify environment

    return {
        httpOnly: true,

        //secure cookies only in production (HTTPS)
        secure: isProduction,

        //SameSite rules for cross-domain production
        sameSite: isProduction ? "None" : "Lax",

        path: "/",

        maxAge:
            type === "access"
                ? 15 * 60 * 1000       // match access token (15 min)
                : 7 * 24 * 60 * 60 * 1000, // match refresh token (7 days)
    };
};
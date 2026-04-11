export const cookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";
    // console.log("Cookie Options - isProduction:", isProduction); // debug log to verify environment

    return {
        httpOnly: true,

        //secure cookies only in production (HTTPS)
        secure: isProduction,

        //SameSite rules for cross-domain production
        sameSite: isProduction ? "None" : "Lax",

        path: "/",

        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    };
};
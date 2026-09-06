import { ApiError } from "../../../../utils/ApiError.js";
import { OAuth2Client } from 'google-auth-library';
import env from "../../../../config/env.config.js";
import { findUserByEmail, createUserByGoogle, createDefaultOrganization } from "../../auth.repository.js";
import { generateSessionId, generateAccessToken, generateRefreshToken } from "../../../../utils/token.js";
import { welcomeEmailTemplate } from "../../../../utils/email/welcomeEmailTemplate.js";
import { sendEmail } from "../../../../integrations/email.integration.js";
import { generateOrgSlug } from "../../auth.helper.js";
import logger from "#/config/logger.js";


const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);


export const googleLoginService = async (body) => {

    const { token, device = "unknown device" } = body;

    const googleToken = typeof token === "string" ? token : token?.token;

    if (!googleToken || typeof googleToken !== "string" || !googleToken.trim()) {
        throw new ApiError(400, "No Google token provided");
    }

    const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: env.GOOGLE_CLIENT_ID,
    });
    if (!ticket) {
        throw new ApiError(401, "Invalid Google token");
    }

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture, email_verified } = payload;

    if (!email_verified) {
        throw new ApiError(403, "Google account email is not verified. Please verify your email with Google before logging in.");
    }

    let user = await findUserByEmail(email);

    let isNewUser = false;

    const safeName = name || email.split("@")[0] || "User";
    const orgName = safeName.split(" ")[0] + "'s Workspace";

    if (!user) {
        // new user
        user = await createUserByGoogle({
            avatar: {
                url: picture,
                publicId: `google-${googleId}`
            },
            name: safeName,
            email,
            providers: {
                local: { enabled: false },
                google: { enabled: true, googleId }
            }
        });



        // default org creation for new user
        try {
            const orgSlug = await generateOrgSlug(orgName);
            const org = await createDefaultOrganization({
                name: orgName,
                owner: user._id,
                slug: orgSlug
            });

            if (org) {
                user.activeOrganization = org._id;
                await user.save();

                logger.info(
                    {
                        email: user.email,
                        orgId: org._id,
                    },
                    "auth.organization.default_created"
                );
            }

        } catch (err) {
            logger.error(
                {
                    email: user.email,
                    error: err.message,
                },
                "auth.organization.default_creation_failed"
            );
        }

        isNewUser = true;
    }

    //deleted users email is modified to deleted_userId_email, to prevent conflicts while registering again with same email
    if (user.accountStatus !== "active") {
        throw new ApiError(403, `Your account has been ${user.accountStatus}. Please contact support for assistance.`);
    }

    if (!user.providers?.google?.enabled) {
        user.providers.google = { enabled: true, googleId };
    }

    const hasAvatar = user.avatar?.url && user.avatar?.url.trim() !== "";
    if (!hasAvatar && picture) {
        user.avatar = {
            url: picture,
            publicId: `google-${googleId}`
        };
    }


    const existingSession = user.sessions?.find(s => s.device === device);

    let sessionId;
    let refreshToken;

    if (existingSession) {
        // Update existing session
        sessionId = existingSession.sessionId;
        refreshToken = generateRefreshToken(user._id, sessionId);
        existingSession.refreshToken = refreshToken;

        existingSession.latestLogin = new Date();
        existingSession.isActive = true;
    } else {
        // New session
        sessionId = generateSessionId();
        refreshToken = generateRefreshToken(user._id, sessionId);

        user.sessions.push({
            sessionId,
            device,
            refreshToken,
            firstLogin: new Date(),
            latestLogin: new Date(),
            isActive: true
        });
    }

    try {
        await user.save();
    } catch (err) {
        throw new ApiError(500, "An error occurred while logging in with Google. Please try again.");
    }

    const accessToken = generateAccessToken(user, sessionId);
    const emailHTML = welcomeEmailTemplate(user.name);

    if (isNewUser) {
        try {
            if (env.EMAIL_ENABLED) {
                await sendEmail(user.email, "Welcome to MySaaS", emailHTML, true);
            } else {
                logger.info(
                    {
                        email: user.email,
                    },
                    "email.welcome.skipped"
                );
            }
        } catch (err) {
            // ignore: already handled in sendEmail
        }
    }

    logger.info(
        {
            email: user.email,
            device,
            isNewUser,
        },
        "auth.user.google_login"
    );

    return {
        user: {
            name: user.name,
            email
        },
        accessToken,
        refreshToken,
        message: isNewUser ? "Your account has been created" : `Welcome back!, ${user.name}`,
    }
};

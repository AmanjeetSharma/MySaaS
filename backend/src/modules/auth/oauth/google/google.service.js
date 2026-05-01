import { ApiError } from "../../../../utils/ApiError.js";
import { OAuth2Client } from 'google-auth-library';
import env from "../../../../config/env.config.js";
import { findUserByEmail, createUserByGoogle, createDefaultOrganization } from "../../auth.repository.js";
import { generateSessionId, generateAccessToken, generateRefreshToken } from "../../../../utils/token.js";
import { welcomeEmailTemplate } from "../../../../utils/email/welcomeEmailTemplate.js";
import { sendEmail } from "../../../../services/email.service.js";


const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);


export const googleLoginService = async (token, device = "unknown device") => {
    if (!token?.trim()) {
        throw new ApiError(400, "No Google token provided");
    }

    const ticket = await client.verifyIdToken({
        idToken: token,
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

    const trimmed = user.name.trim();
    const orgName = trimmed[0].toUpperCase() + trimmed.slice(1) + "'s Workspace";


    if (!user) {
        // new user
        user = await createUserByGoogle({
            avatar: {
                url: picture,
                publicId: `google-${googleId}`
            },
            name,
            email,
            providers: {
                local: { enabled: false },
                google: { enabled: true, googleId }
            }
        });

        // default org creation for new user
        try {
            const org = await createDefaultOrganization({
                name: orgName,
                owner: user._id,
                members: [],
                subscription: {
                    plan: "free",
                    status: "active",
                    startDate: new Date(),
                    endDate: null
                },
                usage: {
                    aiCreditsUsed: 0
                }
            });

            if (org) {
                user.activeOrganization = org._id;
                await user.save();
                console.log(`Default organization created for user ${user.email} | orgId: ${org._id}`);
            }
        } catch (err) {
            console.error(`Error creating default organization for user ${user.email} while google login | Error: ${err.message}`);
        }

        isNewUser = true;
    }

    if (user.accountStatus !== "active") {
        throw new ApiError(403, "Your account is not active. Please contact support for assistance.");
    }

    if (!user.providers?.google?.enabled) {
        user.providers.google = { enabled: true, googleId };
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
        console.error(`[Google Login err log] Error saving user session for ${user.email} | Error: ${err.message}`);
        throw new ApiError(500, "An error occurred while logging in with Google. Please try again.");
    }

    const accessToken = generateAccessToken(user, sessionId);

    if (isNewUser) {
        try {
            if (env.EMAIL_ENABLED) {
                await sendEmail(user.email, "Welcome to MySaaS", welcomeEmailTemplate(user.name), true);
            } else {
                console.log(`Email service is disabled. Skipping welcome email for ${user.email}`);
            }
        } catch (err) {
            console.error(`[Google Login err log] Error sending welcome email to ${user.email} | Error: ${err.message}`);
        }
    }

    console.log(`${isNewUser ? "New user created and logged in with Google" : "Existing user logged in with Google"} | User: ${user.email} | Device: ${device}`);

    return {
        user: {
            name: user.name,
            email
        },
        accessToken,
        refreshToken
    }
};

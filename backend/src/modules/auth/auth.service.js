import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ApiError } from "../../utils/ApiError.js";
import env from "../../config/env.js";
import { nameValidator, emailValidator, passwordValidator, avatarValidator } from "./auth.validators.js";
import { cleanupAvatar, getTimeDifference } from "./auth.helper.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../../services/cloudinary.service.js";
import { generateEmailVerificationToken } from "../../utils/token.js";
import { registerEmailTemplate } from "../../utils/email/registerEmailTemplate.js";
import { welcomeEmailTemplate } from "../../utils/email/welcomeEmailTemplate.js";
import { sendEmail } from "../../services/email.service.js";
import {
    findUserByEmail,
    findPendingUserByEmail,
    createPendingUser,
    savePendingUser,
    findPendingUserByVerificationToken,
    createNewUserFromPending,
    deletePendingUser,
    createDefaultOrganization,
} from "./auth.repository.js";











export const registerService = async (body, avatarFile) => {
    const { name, email, password } = body;

    const cleanUp = (reason) => cleanupAvatar(avatarFile, reason);

    const normalizedEmail = email?.toLowerCase().trim();

    const requiredFields = { name, email: normalizedEmail, password };
    for (const [key, value] of Object.entries(requiredFields)) {
        if (!value?.trim()) {
            cleanUp(`Missing required field: ${key}`); // cleaning up avatar from local storage at missing required fields to avoid orphan files
            throw new ApiError(400, `${key} is required`);
        }
    }

    const nameError = nameValidator(name);
    if (!nameError.valid) {
        cleanUp("Name validation failed");
        throw new ApiError(400, `${nameError.errors.join(", ")}`);
    }

    if (!emailValidator(normalizedEmail)) {
        cleanUp("Email validation failed");
        throw new ApiError(400, "Please provide a valid email address");
    }

    const passwordError = passwordValidator(password);
    if (!passwordError.valid) {
        cleanUp("Password validation failed");
        throw new ApiError(400, `Password is invalid: ${passwordError.errors.join(", ")}`);
    }

    const avatarError = avatarValidator(avatarFile);
    if (!avatarError.valid) {
        cleanUp("Avatar validation failed");
        throw new ApiError(400, `${avatarError.errors.join(", ")}`);
    }

    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
        if (avatarFile) {
            cleanUp("User already exists");
            console.log(`Removed avatar: User already exists`);
        }

        if (existingUser.providers?.google?.enabled) {
            throw new ApiError(409, "Account exists with Google");
        }

        throw new ApiError(409, "Account already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rawToken, hashedToken, expiry } = generateEmailVerificationToken();

    let avatarUrl = "";
    let avatarPublicId = "";

    if (avatarFile?.path) {
        const result = await uploadOnCloudinary(
            avatarFile.path,
            "MySaaS/users/avatars"
        );

        if (!result) {
            throw new ApiError(500, "Avatar upload failed");
        }
        avatarUrl = result.url;
        avatarPublicId = result.publicId;
    }

    const existingPendingUser = await findPendingUserByEmail(normalizedEmail);

    if (existingPendingUser) {
        try {
            if (existingPendingUser.avatar?.publicId) {
                await deleteFromCloudinary(existingPendingUser.avatar.publicId);
                console.log(`Removed old avatar from Cloudinary for existing pending user | email: ${normalizedEmail}`);
            }
        } catch (err) {
            console.error(`Failed to remove old avatar from Cloudinary for existing pending user | email: ${normalizedEmail} | error: ${err.message}`);
        }

        existingPendingUser.avatar.url = avatarUrl;
        existingPendingUser.avatar.publicId = avatarPublicId;
        existingPendingUser.name = name.trim();
        existingPendingUser.password = hashedPassword;
        existingPendingUser.verificationToken = hashedToken;
        existingPendingUser.verificationTokenExpiry = expiry;

        await savePendingUser(existingPendingUser);
        // console.log(`Updated existing pending user with new verification token | email: ${normalizedEmail}`);
    } else {
        await createPendingUser({
            avatar: {
                url: avatarUrl,
                publicId: avatarPublicId
            },
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            verificationToken: hashedToken,
            verificationTokenExpiry: expiry
        });
    }

    // Org assignment will be done after email verification to avoid cluttering database with unverified users and orphaned orgs in case of non verification or spam signups

    console.log(`${existingPendingUser ? "Existing" : "New"} pendingUser ${existingPendingUser ? "updated" : "created"} for ${normalizedEmail} | Token ${rawToken} (duration: 10 mins)`);

    const verificationLink = `${env.CLIENT_URL}/verify/${rawToken}`;

    const emailHTML = registerEmailTemplate(name.trim(), verificationLink);

    if (env.EMAIL_ENABLED) {
        await sendEmail(normalizedEmail, "Kindly Verify Your Email Address - Complete Your Registration", emailHTML, true);
        console.log(`Verification email sent to ${normalizedEmail} | verificationLink: ${verificationLink}`);
    }

    return {
        name: name.trim(),
        email: normalizedEmail
    };
};













export const verifyEmailService = async (token) => {
    if (!token) {
        throw new ApiError(400, "Verification token is required");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const pendingUser = await findPendingUserByVerificationToken(hashedToken);

    if (!pendingUser) {
        throw new ApiError(400, "Invalid or expired token");
    }

    if (pendingUser.verificationTokenExpiry < Date.now()) {
        const timeInfo = getTimeDifference(pendingUser.verificationTokenExpiry);
        console.log(`Token expired ${timeInfo} ago | Email: ${pendingUser.email}`);

        throw new ApiError(
            400,
            `Token expired ${timeInfo} ago. Please register again.`
        );
    }

    // Prevent duplicate user (race condition(multiple clicks on link))
    let user = await findUserByEmail(pendingUser.email);

    if (!user) {
        user = await createNewUserFromPending({
            avatar: {
                url: pendingUser.avatar.url,
                publicId: pendingUser.avatar.publicId
            },
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password,
        });
    }

    await deletePendingUser(pendingUser._id);

    console.log(`Email verified | User: ${user.email} | ID: ${user._id}`);

    // To prevent race condition
    if (!user.activeOrganization) {
        // Default Org assignment
        let organizationName = `${user.name.trim()}'s Workspace`;
        let org;
        try {
            org = await createDefaultOrganization({
                name: organizationName,
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
            console.error(`Default organization creation failed for user ${user.email} after email verification | userId: ${user._id} | error: ${err.message}`);
        }
    }

    try {
        if (env.EMAIL_ENABLED) {
            await sendEmail(user.email, "Welcome to MySaaS", welcomeEmailTemplate(user.name), true);
        }
    } catch (err) { }

    return {
        name: user.name,
        email: user.email
    };
};

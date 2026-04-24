import bcrypt from "bcryptjs";
import { ApiError } from "../../utils/ApiError.js";
import env from "../../config/env.js";
import { findUserByEmail, findPendingUserByEmail, createPendingUser, savePendingUser } from "./auth.repository.js";
import { nameValidator, emailValidator, passwordValidator, avatarValidator } from "./auth.validators.js";
import { cleanupAvatar } from "./auth.helper.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../../services/cloudinary.service.js";
import { generateEmailVerificationToken } from "../../utils/token.js";
import { registerEmailTemplate } from "../../utils/email/registerEmailTemplate.js";
import { sendEmail } from "../../services/email.service.js";







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










// Default Org Creation
// let org;
// try {
//     org = await Organization.create({
//         name: organizationName?.trim() || `${name.trim()}'s Workspace`,
//         owner: user._id,
//     });
// } catch (err) {
//     const result = await User.findByIdAndDelete(user._id); // Rolling back user creation if organization creation fails
//     if (result) {
//         console.log(`Rolled back user creation due to organization creation failure | userId: ${user._id}`);
//     }
//     throw new ApiError(500, "User registration failed, please try again");// throwing generic message to avoid exposing internal errors on rollbacks
// }

// user.activeOrganization = org._id;// default active organization for the user

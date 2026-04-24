import bcrypt from "bcryptjs";
// import { v4 as uuidv4 } from "uuid";
import fs from "fs";

import { User } from "../user/user.model.js";
import { PendingUser } from "../user/pendingUser.model.js";
import { Organization } from "../organization/organization.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../../services/cloudinary.service.js";
import { nameValidator, emailValidator, passwordValidator, avatarValidator } from "../../validations/auth.validators.js";
import { cleanupAvatar } from "./auth.helper.js";
import { generateEmailVerificationToken } from "../../utils/token.js";
import env from "../../config/env.js";
import { registerEmailTemplate } from "../../utils/email/registerEmailTemplate.js";
import { welcomeEmailTemplate } from "../../utils/email/welcomeEmailTemplate.js";
import { sendEmail } from "../../services/email.service.js";




export const register = asyncHandler(async (req, res) => {
    const { name, email, password, organizationName } = req.body;
    const avatarFile = req.file;

    const normalizedEmail = email?.toLowerCase().trim();

    const requiredFields = { name, email: normalizedEmail, password };
    for (const [key, value] of Object.entries(requiredFields)) {
        if (!value?.trim()) {
            throw new ApiError(400, `${key} is required`);
        }
    }

    const cleanUp = (reason) => cleanupAvatar(avatarFile, reason);

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

    if (avatarFile && !avatarValidator(avatarFile)) {
        cleanUp("File validation failed");
        console.log(`Removed avatar image from localServer due to → invalid format or size: ${avatarFile.filename}`);
        throw new ApiError(400, "Image must be a JPEG, PNG, or WebP file (≤ 2MB)");
    }

    const existingUser = await User.findOne({ email: normalizedEmail }); // this checks user 

    if (existingUser) {
        if (avatarFile) {
            cleanUp("User already exists");
            console.log(`Removed avatar → User already exists`);
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
        const result = await uploadOnCloudinary(avatarFile.path, "MySaaS/users/avatars");
        if (!result) throw new ApiError(500, "Avatar upload failed");
        avatarUrl = result.url;
        avatarPublicId = result.publicId;
    }

    const existingPendingUser = await PendingUser.findOne({ email: normalizedEmail });

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

        await existingPendingUser.save();
        console.log(`Updated existing pending user with new verification token | email: ${normalizedEmail}`);
    } else {
        await PendingUser.create({
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

    console.log(`${existingPendingUser ? 'Existing' : 'New'} pendingUser ${existingPendingUser ? 'updated' : 'created'} for ${normalizedEmail} | Token ${rawToken} (duration: 10 mins)`);

    const verificationLink = `${env.CLIENT_URL}/verify/${rawToken}`;
    const emailHTML = registerEmailTemplate(name.trim(), verificationLink);

    if (env.EMAIL_ENABLED) { // Only send email if enabled in environment variables
        await sendEmail(normalizedEmail, "Kindly Verify Your Email Address - Complete Your Registration", emailHTML, true);
        console.log(`Verification email sent to ${normalizedEmail} | verificationLink: ${verificationLink}`);
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                name: name.trim(),
                email: normalizedEmail,
            },
            "Registration initiated. Please check your email to verify your account."
        )
    );
});









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

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ApiError } from "../../../utils/ApiError.js";
import { phoneNumberValidator } from "../../../validations/auth.validators.js";
import { getUserById, getUserByPhone } from "../user.repository.js";








export const addPhoneService = async (userId, phone) => {
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }
    const phoneValidationErrors = phoneNumberValidator(phone);
    if (!phoneValidationErrors.valid) {
        throw new ApiError(400, phoneValidationErrors.errors.join(", "));
    }

    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const existingPhoneOwner = await getUserByPhone(userId, phone);
    if (existingPhoneOwner) {
        throw new ApiError(409, "The provided phone number is already linked with another account.");
    }

    if (user.phone?.number === phone && user.phone?.isVerified === true) {
        throw new ApiError(409, "Phone number already verified");
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    user.phone = {
        pendingNumber: phone,
        isVerified: false,
        otpHash: hashedOtp,
        otpExpiry: Date.now() + 10 * 60 * 1000 // 10 mins
    };

    try {
        await user.save();
    } catch (err) {
        throw new ApiError(500, "Failed to save phone number. Please try again.");
    }

    console.log(`OTP sent to ${phone}: ${otp}`);

    return {
        pendingNumber: phone,
        otpSent: true,
        expiresIn: "10 minutes"
    };
}








export const verifyPhoneOtpService = async (userId, otp) => {
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }
    if (!otp) {
        throw new ApiError(400, "OTP is required");
    }

    if (!/^\d{6}$/.test(otp)) {
        throw new ApiError(400, "OTP must be a valid 6-digit number");
    }

    const user = await getUserById(userId, "+phone.otpHash +phone.otpExpiry");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.phone?.pendingNumber) {
        throw new ApiError(400, "No phone verification request found");
    }

    if (!user.phone?.otpHash || !user.phone?.otpExpiry) {
        throw new ApiError(400, "OTP not found. Please request a new OTP");
    }

    if (new Date() > new Date(user.phone.otpExpiry)) {
        throw new ApiError(400, "OTP has expired. Please request a new OTP");
    }

    const isOtpValid = await bcrypt.compare(otp, user.phone.otpHash);

    if (!isOtpValid) {
        throw new ApiError(400, "Invalid OTP");
    }

    user.phone.number = user.phone.pendingNumber;
    user.phone.pendingNumber = null;
    user.phone.isVerified = true;
    user.phone.otpHash = null;
    user.phone.otpExpiry = null;

    try {
        await user.save();
    } catch (err) {
        throw new ApiError(500, "Failed to verify phone number. Please try again");
    }

    console.log(`Phone number verified for user ${user.email} | phone: ${user.phone.number}`);

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phone.number,
        isVerified: true
    };
};







export const unlinkPhoneService = async (userId) => {
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const user = await getUserById(userId, "+phone.otpHash +phone.otpExpiry");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const hasPhone = user.phone?.number || user.phone?.pendingNumber;
    if (!hasPhone) {
        throw new ApiError(400, "No phone number found to remove");
    }

    let message;
    if (user.phone?.number) {
        message = "Phone number unlinked successfully";
    } else {
        message = "Phone number removed successfully";
    }

    user.phone = {
        number: null,
        pendingNumber: null,
        isVerified: false,
        otpHash: null,
        otpExpiry: null
    };

    try {
        await user.save();
    } catch (error) {
        throw new ApiError(
            500,
            "Failed to remove phone number. Please try again."
        );
    }

    console.log(`Phone number removed/unlinked for user ${user.email} | phone: ${user.phone.number}`);

    return {
        removed: true,
        message
    };
};
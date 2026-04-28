import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { addPhoneService, verifyPhoneOtpService, unlinkPhoneService } from "./phone.service.js";


export const addPhone = asyncHandler(async (req, res) => {
    const data = await addPhoneService(req.user._id, req.body.phone);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "OTP sent to the provided phone number if it exists. Please verify to complete the process."
        ));
});


export const verifyPhoneOtp = asyncHandler(async (req, res) => {
    const data = await verifyPhoneOtpService(req.user._id, req.body.otp);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "Phone number verified successfully."
        ));
});


export const unlinkPhone = asyncHandler(async (req, res) => {
    const data = await unlinkPhoneService(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            data.message
        ));
});
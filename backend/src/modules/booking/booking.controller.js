import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    createBookingService
} from "./booking.service.js";

export const createBookingController = asyncHandler(async (req, res) => {


    const data = await createBookingService(req.body);

    return res.status(201).json(
        new ApiResponse(
            201,
            data,
            "Booking created successfully."
        )
    );
});

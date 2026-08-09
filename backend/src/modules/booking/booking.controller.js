import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    createBookingService,
    cancelBookingService,
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


export const cancelBookingController = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { orgId, cancellationReason, } = req.body;
    
    const data = await cancelBookingService({
        userId: req.user._id,
        orgId,
        bookingId,
        cancellationReason,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Booking cancelled successfully."
        )
    );
}
);
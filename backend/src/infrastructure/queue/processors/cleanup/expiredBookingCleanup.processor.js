import { expirePendingBookings } from "#/modules/booking/booking.repository.js";
import logger from "#/config/logger.js";

export const processExpiredBookingCleanup = async () => {
    const result = await expirePendingBookings();

    if (
        result.bookingModifiedCount === 0 &&
        result.paymentModifiedCount === 0
    ) {
        return result;
    }

    logger.info(
        {
            expiredBookings: result.bookingModifiedCount,
            expiredPayments: result.paymentModifiedCount,
        },
        "cleanup.expiredBookingCleanup.completed"
    );

    return result;
};
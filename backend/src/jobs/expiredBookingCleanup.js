import chalk from "chalk";
import { expirePendingBookings } from "../modules/booking/booking.repository.js";

export const runExpiredBookingCleanup = async () => {
    try {
        const result = await expirePendingBookings();

        if (result.bookingModifiedCount === 0 && result.paymentModifiedCount === 0) {
            return;
        }

        console.log(
            `${new Date().toLocaleString()} ` +
            `${chalk.green("[ExpiredBookingCleanup]")} ` +
            `Cleanup completed. ` +
            `Expired bookings: ${result.bookingModifiedCount} | ` +
            `Expired payments: ${result.paymentModifiedCount}`
        );

    } catch (error) {

        console.error(
            `${new Date().toLocaleString()} ` +
            `${chalk.red("[ExpiredBookingCleanup]")} ` +
            `Cleanup job failed:`,
            error.message
        );
    }
};
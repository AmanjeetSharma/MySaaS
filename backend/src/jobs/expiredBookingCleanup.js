import chalk from "chalk";
import { expirePendingBookings } from "../modules/booking/booking.repository.js";


export const runExpiredBookingCleanup = async () => {
    try {
        const now = new Date();

        const result = await expirePendingBookings(now);

        if (result.modifiedCount === 0) {
            // console.log(`${new Date().toLocaleString()} ${chalk.yellow("[ExpiredBookingCleanup]")} No expired pending bookings found`);
            return;
        }

        console.log(`${new Date().toLocaleString()} ${chalk.green("[ExpiredBookingCleanup]")} Marked expired pending bookings: ${result.modifiedCount}`);

    } catch (error) {
        console.error(`${new Date().toLocaleString()} ${chalk.red("[ExpiredBookingCleanup]")} Cleanup job failed:`, error.message);
    }
};
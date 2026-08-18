import { ApiError } from "../../utils/ApiError.js";
import {
    createRazorpayOrder,
} from "../../integrations/razorpay.integration.js";
import {
    validatePaymentRequest,
    validateBookingForPayment,
} from "./payment.helper.js";
import {
    findBookingForPayment,
    findPaymentByBooking,
    createPayment,
} from "./payment.repository.js";


export const createPaymentService = async ({
    bookingId,
}) => {

    validatePaymentRequest({ bookingId });

    const booking = await findBookingForPayment(bookingId);
    if(!booking){
        console.log("Booking not found");
    }

    validateBookingForPayment(booking);


    // 4. Check if payment already exists
    const existingPayment = await findPaymentByBooking(
        bookingId
    );

    if (existingPayment) {
        return {
            paymentId: existingPayment._id,
            razorpayOrderId: existingPayment.razorpayOrderId,
            amount: existingPayment.amount,
            currency: existingPayment.currency,
            status: existingPayment.status,
        };
    }


    // 5. Get amount from trusted booking snapshot
    const amount = Math.round(
        booking.serviceSnapshot.price * 100
    );

    const currency =
        booking.serviceSnapshot.currency.toUpperCase();


    // 6. Create Razorpay receipt
    const receipt = `booking_${booking._id}`;


    // 7. Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
        amount,
        currency,
        receipt,
    });


    if (!razorpayOrder?.id) {
        throw new ApiError(
            502,
            "Failed to create payment order."
        );
    }


    // 8. Store payment in MongoDB
    const payment = await createPayment({
        organization: booking.organization,
        booking: booking._id,

        provider: "RAZORPAY",

        amount,
        currency,

        status: "CREATED",

        razorpayOrderId: razorpayOrder.id,

        receipt,
    });


    // 9. Return only what frontend needs
    return {
        paymentId: payment._id,

        razorpayOrderId: razorpayOrder.id,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        keyId: env.RAZORPAY_KEY_ID,

        status: payment.status,
    };
};
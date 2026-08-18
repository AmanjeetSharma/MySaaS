import { Payment } from "./payment.model.js";
import { Booking } from "../booking/booking.model.js";


export const findBookingForPayment = async (bookingId) => {
    return Booking.findById(bookingId);
};


export const findPaymentByBooking = async (bookingId) => {
    return Payment.findOne({
        booking: bookingId,
    });
};


export const createPayment = async (paymentData) => {
    return Payment.create(paymentData);
};
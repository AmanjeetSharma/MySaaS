export const buildBookingRealtimePayload = (booking) => {
    return {
        bookingId: booking._id,
        organizationId: booking.organization,
        serviceId: booking.service,

        booker: booking.booker,

        service: booking.serviceSnapshot,

        startTime: booking.startTime,
        endTime: booking.endTime,
        timezone: booking.timezone,

        status: booking.status,

        meeting: booking.meeting,
        calendarEvent: booking.calendarEvent,
    };
};
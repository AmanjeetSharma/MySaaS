import { getIO } from "../socket.js";
import { getOrganizationRoom } from "../rooms/organization.rooms.js";
import { SOCKET_EVENTS } from "../events/socketEventNames.js";

export const emitNewBooking = (organizationId, booking) => {
    const io = getIO();
    const room = getOrganizationRoom(organizationId);

    io.to(room).emit(SOCKET_EVENTS.BOOKING_NEW, booking);
};


export const emitBookingUpdated = (organizationId, booking) => {
    const io = getIO();
    const room = getOrganizationRoom(organizationId);

    io.to(room).emit(SOCKET_EVENTS.BOOKING_UPDATED, booking);
};


export const emitBookingStatusChanged = (organizationId, booking) => {
    const io = getIO();
    const room = getOrganizationRoom(organizationId);

    io.to(room).emit(SOCKET_EVENTS.BOOKING_STATUS_CHANGED, booking);
};


export const emitBookingRescheduled = (organizationId, booking) => {
    const io = getIO();
    const room = getOrganizationRoom(organizationId);

    io.to(room).emit(SOCKET_EVENTS.BOOKING_RESCHEDULED, booking);
};


export const emitBookingCancelled = (organizationId, booking) => {
    const io = getIO();
    const room = getOrganizationRoom(organizationId);

    io.to(room).emit(SOCKET_EVENTS.BOOKING_CANCELLED, booking);
};
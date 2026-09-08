import { getIO } from "../socket.js";
import { getOrganizationRoom } from "../rooms/organization.rooms.js";
import { SOCKET_EVENTS } from "../events/socketEventNames.js";

export const emitNewBooking = (organizationId, booking) => {
    const io = getIO();
    const room = getOrganizationRoom(organizationId);

    io.to(room).emit(SOCKET_EVENTS.BOOKING_NEW, booking);
};
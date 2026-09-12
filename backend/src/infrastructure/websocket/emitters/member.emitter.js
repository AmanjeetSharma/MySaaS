import { getIO } from "../socket.js";
import { getUserRoom } from "../rooms/user.rooms.js";
import { SOCKET_EVENTS } from "../events/socketEventNames.js";
import { getOrganizationRoom } from "../rooms/organization.rooms.js";

export const emitMemberInvitation = (userId, invitation) => {
    const io = getIO();
    const room = getUserRoom(userId);

    io.to(room).emit(SOCKET_EVENTS.MEMBER_INVITATION_RECEIVED, invitation);
};


export const emitMemberJoined = (organizationId, member) => {
    const io = getIO();
    const room = getOrganizationRoom(organizationId);

    io.to(room).emit(SOCKET_EVENTS.MEMBER_JOINED, member);
};


export const emitMemberRemovedToOrganization = (organizationId, removedUserId, member) => {
    const io = getIO();
    const room = getOrganizationRoom(organizationId);

    io.to(room)
        .except(getUserRoom(removedUserId)) // not sending to the removed member
        .emit(
            SOCKET_EVENTS.MEMBER_REMOVED,
            member
        );
};


export const emitMemberLeft = (organizationId, leavingUserId, member) => {
    const io = getIO();
    const room = getOrganizationRoom(organizationId);

    io.to(room)
        .except(getUserRoom(leavingUserId)) // not sending to the leaving member
        .emit(SOCKET_EVENTS.MEMBER_LEFT, member);
}




export const emitMemberDeclinedInvitation = (ownerUserId, invitation) => {
    const io = getIO();
    const room = getUserRoom(ownerUserId);

    io.to(room).emit(SOCKET_EVENTS.MEMBER_INVITATION_DECLINED, invitation);
}
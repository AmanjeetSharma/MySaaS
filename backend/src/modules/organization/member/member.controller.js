import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
    getMembersService,
    inviteMemberService,
    acceptInvitationService,
    getInvitationsService,
    removeMemberService,
    leaveOrganizationService,
    getMyInvitationsService,
} from "./member.service.js";


export const getMembersController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const orgId = req.params.orgId;

    const data = await getMembersService({
        userId,
        orgId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Organization members retrieved successfully"
        ));
});


export const inviteMemberController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const orgId = req.params.orgId;
    const email = req.body.email;
    const inviterName = req.user.name;

    const data = await inviteMemberService({
        userId,
        orgId,
        email,
        inviterName
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Invitation sent successfully"
        ));
});


export const acceptInvitationController = asyncHandler(async (req, res) => {
    const {
        _id: userId,
        name: userName,
        email: userEmail
    } = req.user;

    const orgId = req.body.orgId;

    const data = await acceptInvitationService({
        userId,
        userName,
        userEmail,
        orgId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Invitation accepted successfully"
        ));
});


export const removeMemberController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const orgId = req.params.orgId;
    const memberId = req.params.memberId;

    const data = await removeMemberService({
        userId,
        orgId,
        memberId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Member removed successfully"
        ));
});

export const leaveOrganizationController = asyncHandler(async (req, res) => {
    const {
        _id: userId,
        name: userName,
        email: userEmail
    } = req.user;
    const orgId = req.params.orgId;

    const data = await leaveOrganizationService({
        userId,
        userName,
        userEmail,
        orgId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "User left the organization successfully"
        ));
});



export const getInvitationsController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const orgId = req.params.orgId;

    const data = await getInvitationsService({
        userId,
        orgId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Organization invitations retrieved successfully"
        ));
});


export const getMyInvitationsController = asyncHandler(async (req, res) => {
    const email = req.user.email;

    const data = await getMyInvitationsService({
        userEmail: email
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "User's invitations retrieved successfully"
        ));
});
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
    getMembersService,
    inviteMemberService,
    acceptInvitationService,
    getPendingInvitationsService,
    // removeMemberService,
    // leaveOrganizationService
} from "./member.service.js";

export const getMembersController = asyncHandler(async (req, res) => {
    const data = await getMembersService(req.user._id, req.params.orgId);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Organization members retrieved successfully"
        ));
});


export const inviteMemberController = asyncHandler(async (req, res) => {
    const data = await inviteMemberService(req.user._id, req.user.name, req.params.orgId, req.body.email);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Invitation sent successfully"
        ));
});


export const acceptInvitationController = asyncHandler(async (req, res) => {
    const data = await acceptInvitationService(req.user._id, req.body.token);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Invitation accepted successfully"
        ));
});


export const getPendingInvitationsController = asyncHandler(async (req, res) => {
    const data = await getPendingInvitationsService(req.user._id, req.params.orgId);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Pending invitations retrieved successfully"
        ));
});


export const removeMemberController = asyncHandler(async (req, res) => {
    await removeMemberService(req.params.orgId, req.params.memberId, req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Member removed successfully"
        ));
});


export const leaveOrganizationController = asyncHandler(async (req, res) => {
    await leaveOrganizationService(req.params.orgId, req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Left organization successfully"
        ));
});


export const deleteOrganizationController = asyncHandler(async (req, res) => {
    await deleteOrganizationService(req.user._id, req.params.orgId);

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Organization deleted successfully"
        ));
});



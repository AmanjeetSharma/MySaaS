import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

import {
    getMembersController,
    getMemberInfoController,
    inviteMemberController,
    acceptInvitationController,
    getInvitationsController,
    removeMemberController,
    leaveOrganizationController,
    getMyInvitationsController,
    declineInvitationController,
    revokeInvitationController,
} from "./member.controller.js";

const router = express.Router();


// member routes

router.get("/invitations", verifyToken, getMyInvitationsController);

router.post("/invitations/:invitationId/accept", verifyToken, acceptInvitationController);

router.post("/invitations/:invitationId/decline", verifyToken, declineInvitationController);

router.get("/:orgId/invitations", verifyToken, getInvitationsController);

router.post("/:orgId/invite", verifyToken, inviteMemberController);

router.post("/:orgId/:invitationId/revoke", verifyToken, revokeInvitationController);

router.post("/:orgId/leave", verifyToken, leaveOrganizationController);

router.delete("/:orgId/:memberId", verifyToken, removeMemberController);

router.get("/:orgId/:memberId", verifyToken, getMemberInfoController);

router.get("/:orgId", verifyToken, getMembersController);


export default router;
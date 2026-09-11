import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

import {
    getMembersController,
    inviteMemberController,
    acceptInvitationController,
    getInvitationsController,
    removeMemberController,
    leaveOrganizationController,
    getMyInvitationsController,
} from "./member.controller.js";

const router = express.Router();


// member routes

router.get("/invitations", verifyToken, getMyInvitationsController);

router.post("/invitations/:invitationId/accept", verifyToken, acceptInvitationController);

router.get("/:orgId", verifyToken, getMembersController);

router.post("/:orgId/invite", verifyToken, inviteMemberController);

router.get("/:orgId/invitations", verifyToken, getInvitationsController);

router.delete("/:orgId/:memberId", verifyToken, removeMemberController);

router.post("/:orgId/leave", verifyToken, leaveOrganizationController);



export default router;
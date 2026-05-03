import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import {
    createOrganizationController,
    getOrganizationsController,
    getOrganizationController,
    updateOrganizationController,
    deleteOrganizationController,
    switchOrganizationController
} from "./organization.controller.js";
import {
    getMembersController,
    inviteMemberController,
    acceptInvitationController,
    getPendingInvitationsController,
    removeMemberController,
    leaveOrganizationController
} from "./member/member.controller.js";

const router = express.Router();


// organization routes

router.post("/", verifyToken, createOrganizationController);
router.get("/", verifyToken, getOrganizationsController);
router.get("/:orgId", verifyToken, getOrganizationController);
router.patch("/:orgId", verifyToken, updateOrganizationController);
router.delete("/:orgId", verifyToken, deleteOrganizationController);
router.post("/:orgId/switch", verifyToken, switchOrganizationController);


// member routes

router.get("/:orgId/members", verifyToken, getMembersController);
router.post("/:orgId/invite", verifyToken, inviteMemberController);
router.post("/:orgId/invitations/accept", verifyToken, acceptInvitationController);
router.get("/:orgId/invitations", verifyToken, getPendingInvitationsController);
router.delete("/:orgId/members/:memberId", verifyToken, removeMemberController);
router.post("/:orgId/leave", verifyToken, leaveOrganizationController);



export default router;
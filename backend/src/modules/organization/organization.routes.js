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

const router = express.Router();


// organization routes

router.post("/", verifyToken, createOrganizationController);
router.get("/", verifyToken, getOrganizationsController);
router.get("/:orgId", verifyToken, getOrganizationController);
router.patch("/:orgId", verifyToken, updateOrganizationController);
router.delete("/:orgId", verifyToken, deleteOrganizationController);
router.post("/:orgId/switch", verifyToken, switchOrganizationController);


// member routes

// router.get("/:orgId/members", verifyToken, getOrganizationMembersController);
// router.patch("/:orgId/members/:memberId", verifyToken, updateMemberRoleController);
// router.delete("/:orgId/members/:memberId", verifyToken, removeMemberController);
// router.post("/:orgId/invite", verifyToken, inviteMemberController);
// router.get("/:orgId/invitations", verifyToken, getPendingInvitationsController);
// router.post("/:orgId/leave", verifyToken, leaveOrganizationController);



export default router;
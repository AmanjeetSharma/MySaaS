import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import {
    createOrganizationController,
    getOrganizationsController,
    getOrganizationController,
    updateOrganizationController,
    deleteOrganizationController,
    switchOrganizationController,
    syncOrganizationSlugController
} from "./organization.controller.js";

const router = express.Router();

// organization routes

router.post("/", verifyToken, createOrganizationController);
router.get("/", verifyToken, getOrganizationsController);
router.get("/:orgId", verifyToken, getOrganizationController);
router.patch("/:orgId", verifyToken, updateOrganizationController);
router.delete("/:orgId", verifyToken, deleteOrganizationController);
router.post("/:orgId/switch", verifyToken, switchOrganizationController);
router.post("/:orgId/sync-slug", verifyToken, syncOrganizationSlugController);


export default router;
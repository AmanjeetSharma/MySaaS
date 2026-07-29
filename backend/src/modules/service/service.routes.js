import express from 'express';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import {
    createServiceController,
    updateServiceController,
    deleteServiceController,
    getServiceByIdController,
    getOrganizationServicesController,
    getServiceBySlugController,
    toggleServiceStatusController,
    toggleAutoGenerateMeetingLinkController,
    syncServiceSlugController,
} from './service.controller.js';

const router = express.Router();

router.post("/", verifyToken, createServiceController);
router.get("/:serviceId", verifyToken, getServiceByIdController);
router.patch("/:serviceId", verifyToken, updateServiceController);
router.delete("/:serviceId", verifyToken, deleteServiceController);
router.get("/organization/:orgId", verifyToken, getOrganizationServicesController);
router.patch("/:serviceId/toggle-status", verifyToken, toggleServiceStatusController);
router.patch("/:serviceId/toggle-auto-generate-meeting-link", verifyToken, toggleAutoGenerateMeetingLinkController);
router.patch("/:serviceId/sync-slug", verifyToken, syncServiceSlugController);
router.get("/public/:orgSlug/:serviceSlug", getServiceBySlugController);// public api

export default router;
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
    syncServiceSlugController
} from './service.controller.js';

const router = express.Router();

router.post("/", verifyToken, createServiceController);
router.patch("/:serviceId", verifyToken, updateServiceController);
router.delete("/:serviceId", verifyToken, deleteServiceController);
router.get("/:serviceId", verifyToken, getServiceByIdController);
router.get("/organization/:orgId", verifyToken, getOrganizationServicesController);
router.get("/:orgSlug/:serviceSlug", getServiceBySlugController);// public api
router.patch("/:serviceId/toggle-status", verifyToken, toggleServiceStatusController);
router.patch("/:serviceId/toggle-auto-generate-meeting-link", verifyToken, toggleAutoGenerateMeetingLinkController);
router.post("/:serviceId/sync-slug", verifyToken, syncServiceSlugController);

export default router;
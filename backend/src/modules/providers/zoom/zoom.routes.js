import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware.js";
import {
    connectZoomController,
    zoomOAuthCallbackController,
    getZoomIntegrationStatusController,
    disconnectZoomController,
} from "./zoom.controller.js";

const router = express.Router();

router.get("/connect/:orgId", verifyToken, connectZoomController);
router.get("/oauth/callback", zoomOAuthCallbackController);

router.get("/status/:orgId", verifyToken, getZoomIntegrationStatusController);

router.delete("/disconnect/:orgId", verifyToken, disconnectZoomController);

export default router;
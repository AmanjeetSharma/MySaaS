import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware.js";
import {
    connectGoogleController,
    googleOAuthCallbackController,
    getGoogleIntegrationStatusController,
    disconnectGoogleController,
    listGoogleCalendarsController,
} from "./google.controller.js";

const router = express.Router();

// Google OAuth routes
router.get("/connect/:organizationId", verifyToken, connectGoogleController);
router.get("/callback", googleOAuthCallbackController);

// Google Integration routes
router.get("/status/:organizationId", verifyToken, getGoogleIntegrationStatusController);//Get current integration status
router.get("/calendars/:organizationId", verifyToken, listGoogleCalendarsController);//list all calendars available to the connected account
router.delete("/disconnect/:organizationId", verifyToken, disconnectGoogleController);//disconnect google acc

export default router;
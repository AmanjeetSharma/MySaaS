import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware.js";
import {
    connectGoogleController,
    googleOAuthCallbackController,
    getGoogleIntegrationStatusController,
    disconnectGoogleController,
    listGoogleCalendarsController,
    updateSelectedCalendarController,
} from "./google.controller.js";

const router = express.Router();

// Google OAuth routes
router.get("/connect/:orgId", verifyToken, connectGoogleController);
router.get("/callback", googleOAuthCallbackController);

// Google Integration routes
router.patch("/calendar/:orgId", verifyToken, updateSelectedCalendarController);
router.get("/status/:orgId", verifyToken, getGoogleIntegrationStatusController);//Get current integration status
router.get("/calendars/:orgId", verifyToken, listGoogleCalendarsController);//list all calendars available to the connected account
router.delete("/disconnect/:orgId", verifyToken, disconnectGoogleController);//disconnect google acc

export default router;
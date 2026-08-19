import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import {
    getPublicBookingController,
    publicRescheduleBookingController,
    publicCancelBookingController,

    getOrganizationBookingsController,
    getServiceBookingsController,
    
    getBookingByIdController,
    updateBookingController,
    updateBookingStatusController,

    rescheduleBookingController,
    cancelBookingController,
} from "./booking.controller.js";

const router = express.Router();

// Public booking routes

router.get("/manage", getPublicBookingController); 
router.patch("/manage/reschedule", publicRescheduleBookingController);
router.patch("/manage/cancel", publicCancelBookingController); 

// Staff routes

router.get("/organization/:orgId", verifyToken, getOrganizationBookingsController);
router.get("/service/:serviceId", verifyToken, getServiceBookingsController);

router.get("/:bookingId", verifyToken, getBookingByIdController);
router.patch("/:bookingId", verifyToken, updateBookingController);
router.patch("/:bookingId/status", verifyToken, updateBookingStatusController);

router.patch("/:bookingId/reschedule", verifyToken, rescheduleBookingController);
router.patch("/:bookingId/cancel", verifyToken, cancelBookingController);

export default router;
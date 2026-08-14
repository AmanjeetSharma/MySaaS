import express from 'express';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import {
    createBookingController,

    // getBookingByIdController,
    // getOrganizationBookingsController,
    // getServiceBookingsController,

    // updateBookingController,
    // updateBookingStatusController,
    rescheduleBookingController,

    cancelBookingController,
    // deleteBookingController,

    getPublicBookingController,
    publicRescheduleBookingController,
    // publicCancelBookingController,
} from './booking.controller.js';

const router = express.Router();

router.post("/", createBookingController); // public api

// router.get("/organization/:orgId", verifyToken, getOrganizationBookingsController);
// router.get("/service/:serviceId", verifyToken, getServiceBookingsController);

// router.get("/:bookingId", verifyToken, getBookingByIdController);
// router.patch("/:bookingId", verifyToken, updateBookingController);
// router.patch("/:bookingId/status", verifyToken, updateBookingStatusController);
router.patch("/:bookingId/reschedule", verifyToken, rescheduleBookingController);
router.patch("/:bookingId/cancel", verifyToken, cancelBookingController);

router.get("/manage", getPublicBookingController);// public api
router.patch("/manage/rescheedule", publicRescheduleBookingController); // public api
// router.patch("/manage/cancel", publicCancelBookingController); // public api

export default router;


import express from "express";
import {
    createPaymentController,
    verifyPaymentController,
    handleRazorpayWebhookController,
    // getOrganizationPaymentsController,
    // getPaymentByIdController,
} from "./payment.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public Routes
// Create Razorpay payment order
router.post("/create",  createPaymentController);

// Verify Razorpay payment
router.post("/verify", verifyPaymentController);

// Webhook for Razorpay payment events (e.g., payment captured, payment failed) more like a 
router.post("/webhook", handleRazorpayWebhookController);

// Staff Routes
// router.get("/organization", verifyToken, getOrganizationPaymentsController);
// router.get("/:paymentId", verifyToken, getPaymentByIdController);


export default router;
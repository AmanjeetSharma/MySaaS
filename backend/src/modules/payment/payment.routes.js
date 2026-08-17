import express from "express";
import {
    createPayment,
    verifyPayment,
    getOrganizationPayments,
    getPaymentById,
} from "./payment.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { requireOrganizationMember } from "../../middlewares/organization.middleware.js";

const router = express.Router();

// Public Routes
// Create Razorpay payment order
router.post("/create", createPayment);

// Verify Razorpay payment
router.post("/verify", verifyPayment);

// Webhook for Razorpay payment events (e.g., payment captured, payment failed) more like a 
router.post("/webhook", handleRazorpayWebhook);

// Staff Routes
router.get("/organization", verifyToken, getOrganizationPayments);
router.get("/:paymentId", verifyToken, getPaymentById);


export default router;
import express from "express";
import { upload } from "../../middlewares/multer.middleware.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import {
    registerController,
    verifyEmailController,
    loginController,
    logoutController,
    refreshTokenController
} from "./auth.controller.js";
import { googleLoginController } from "./oauth/google/google.controller.js";
import {
    loginRateLimiter,
    registerRateLimiter,
    verifyEmailRateLimiter,
    googleLoginRateLimiter,
    refreshRateLimiter,
    logoutRateLimiter
} from "../../infrastructure/security/rateLimiters/auth.rateLimiter.js";
import loginAbuseProtection from "../../infrastructure/security/abuseProtection/login.abuseProtection.js";

const router = express.Router();

router.post("/register", registerRateLimiter, upload.single("avatar"), registerController);

router.post("/verify-email/:token", verifyEmailRateLimiter, verifyEmailController);

router.post("/login", loginRateLimiter, loginAbuseProtection, loginController);

router.post("/login/google", googleLoginRateLimiter, googleLoginController);

router.post("/logout", verifyToken, logoutRateLimiter, logoutController);

router.post("/refresh", refreshRateLimiter, refreshTokenController);

export default router;
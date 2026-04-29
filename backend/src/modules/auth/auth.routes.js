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

const router = express.Router();

router.post("/register", upload.single("avatar"), registerController);

router.post("/verify-email/:token", verifyEmailController);

router.post("/login", loginController);

router.post("/login/google", googleLoginController);

router.post("/logout", verifyToken, logoutController);

router.post("/refresh", refreshTokenController);

export default router;
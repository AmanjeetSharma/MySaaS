import express from "express";
import { upload } from "../../middlewares/multer.middleware.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { register, verifyEmail, login, logout, refreshToken } from "./auth.controller.js";
import { googleLoginController } from "./oauth/google/google.controller.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), register);

router.post("/verify-email/:token", verifyEmail);

router.post("/login", login);

router.post("/login/google", googleLoginController);

router.post("/logout", verifyToken, logout);

router.post("/refresh", refreshToken);

export default router;
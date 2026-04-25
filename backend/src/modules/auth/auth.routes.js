import express from "express";
import { register, verifyEmail, login, logout, logoutAll, refreshToken } from "./auth.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), register);

router.post("/verify-email/:token", verifyEmail);

router.post("/login", login);

router.post("/logout", verifyToken, logout);

router.post("/logout-all", verifyToken, logoutAll);

router.post("/refresh", refreshToken);

export default router;
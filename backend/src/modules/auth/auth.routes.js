import express from "express";
import { register, verifyEmail } from "./auth.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), register);

router.post("/verify-email/:token", verifyEmail);

// router.post("/login", login);

// router.post("/logout", logout);

export default router;
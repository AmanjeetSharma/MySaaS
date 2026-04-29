import express from "express";
import { upload } from "../../middlewares/multer.middleware.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

import {
    getUserController,
    updateUserController,
    updateUserAvatarController,
    deleteUserAvatarController
} from "./user/user.controller.js";

import {
    getUserSessionsController,
    logoutSessionByIdController,
    logoutAllSessionsController
} from "./sessions/sessions.controller.js";

import {
    changePasswordController,
    forgotPasswordController,
    resetPasswordController
} from "./password/password.controller.js";

import {
    addPhoneController,
    verifyPhoneOtpController,
    unlinkPhoneController
} from "./phone/phone.controller.js";

import {
    updateThemeController,
    updateTimezoneController,
    updateNotificationsController
} from "./settings/settings.controller.js";

const router = express.Router();

// Profile routes
router.get("/me", verifyToken, getUserController);
router.patch("/me", verifyToken, updateUserController);
router.patch('/me/avatar', verifyToken, upload.single('avatar'), updateUserAvatarController);
router.delete('/me/avatar', verifyToken, deleteUserAvatarController);


// Sessions routes
router.get("/sessions", verifyToken, getUserSessionsController);
router.post("/sessions/logout/:sessionId", verifyToken, logoutSessionByIdController);
router.post("/sessions/logout", verifyToken, logoutAllSessionsController);


// Password routes
router.post("/password/change", verifyToken, changePasswordController);
router.post("/password/forgot", forgotPasswordController);
router.post("/password/reset", resetPasswordController);


// Phone routes
router.post("/phone", verifyToken, addPhoneController);
router.post("/phone/verify", verifyToken, verifyPhoneOtpController);
router.delete("/phone", verifyToken, unlinkPhoneController);


// Settings routes
router.patch("/settings/theme", verifyToken, updateThemeController);
router.patch("/settings/timezone", verifyToken, updateTimezoneController);
router.patch("/settings/notifications", verifyToken, updateNotificationsController);


export default router;
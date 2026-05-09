import express from "express";
import { upload } from "../../middlewares/multer.middleware.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

import {
    getUserController,
    updateUserController,
    updateUserAvatarController,
    deleteUserAvatarController,
    deleteUserController
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
    updateNotificationsController,
    getSettingsController
} from "./settings/settings.controller.js";

const router = express.Router();

// Profile routes
router.get("/me", verifyToken, getUserController);
router.patch("/me", verifyToken, updateUserController);
router.patch('/me/avatar', verifyToken, upload.single('avatar'), updateUserAvatarController);
router.delete('/me/avatar', verifyToken, deleteUserAvatarController);
router.delete('/me/account', verifyToken, deleteUserController);//done


// Sessions routes
router.get("/sessions", verifyToken, getUserSessionsController);//done
router.post("/sessions/logout/:sessionId", verifyToken, logoutSessionByIdController);//done
router.post("/sessions/logout", verifyToken, logoutAllSessionsController);//done


// Password routes
router.post("/password/change", verifyToken, changePasswordController);//done
router.post("/password/forgot", forgotPasswordController);//done
router.post("/password/reset", resetPasswordController);//done


// Phone routes
router.post("/phone", verifyToken, addPhoneController);
router.post("/phone/verify", verifyToken, verifyPhoneOtpController);
router.delete("/phone", verifyToken, unlinkPhoneController);


// Settings routes
router.patch("/settings/theme", verifyToken, updateThemeController);//done
router.patch("/settings/timezone", verifyToken, updateTimezoneController);//done
router.patch("/settings/notifications", verifyToken, updateNotificationsController);// DONE 
router.get("/settings", verifyToken, getSettingsController);//done


export default router;
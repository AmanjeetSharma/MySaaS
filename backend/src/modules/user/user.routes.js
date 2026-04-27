import express from "express";
import { upload } from "../../middlewares/multer.middleware.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { getUser, updateUser, updateUserAvatar, deleteUserAvatar } from "./user/user.controller.js";
import { getUserSessions, logoutSessionById, logoutAllSessions } from "./sessions/sessions.controller.js";
import { changePassword, forgotPassword, resetPassword } from "./password/password.controller.js";
// import { getUserSettings, updateUserSettings } from "./settings/settings.controller.js";
// import { addPhone, verifyPhone } from "./phone/phone.controller.js";

const router = express.Router();

// Profile routes
router.get("/me", verifyToken, getUser);
router.patch("/me", verifyToken, updateUser);
router.patch('/me/avatar', verifyToken, upload.single('avatar'), updateUserAvatar);
router.delete('/me/avatar', verifyToken, deleteUserAvatar);

// Sessions routes
router.get("/sessions", verifyToken, getUserSessions);
router.post("/sessions/logout/:sessionId", verifyToken, logoutSessionById);
router.post("/sessions/logout", verifyToken, logoutAllSessions);

// Password routes
router.post("/password/change", verifyToken, changePassword);
router.post("/password/forgot", forgotPassword);
router.post("/password/reset", resetPassword);

// Settings routes
// router.get("/settings", verifyToken, getUserSettings);
// router.patch("/settings", verifyToken, updateUserSettings);

// Phone routes
// router.post("/phone", verifyToken, addPhone); // add and send otp(if number exists just send otp)
// router.post("/phone/verify", verifyToken, verifyPhone); // verify otp

export default router;